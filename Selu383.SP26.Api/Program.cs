using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Receipts;
using Selu383.SP26.Api.Features.Payments;
using Stripe;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<DataContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DataContext")));

builder.Services.AddIdentity<User, Role>()
    .AddEntityFrameworkStores<DataContext>();

var isDevelopment = builder.Environment.IsDevelopment();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = "Selu383.Auth";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.None;
    options.Cookie.SecurePolicy = isDevelopment ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;

    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = 401;
        return Task.CompletedTask;
    };

    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = 403;
        return Task.CompletedTask;
    };
});

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<ReceiptPdfService>();
builder.Services.AddScoped<BlobStorageService>();
builder.Services.AddScoped<StripePaymentService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendApps", policy =>
    {
        policy
            .SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin))
                {
                    return false;
                }

                if (origin.StartsWith("http://localhost:", StringComparison.OrdinalIgnoreCase) ||
                    origin.StartsWith("https://localhost:", StringComparison.OrdinalIgnoreCase) ||
                    origin.StartsWith("http://127.0.0.1:", StringComparison.OrdinalIgnoreCase) ||
                    origin.StartsWith("https://127.0.0.1:", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }

                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                {
                    return false;
                }

                return uri.Scheme == Uri.UriSchemeHttps &&
                       (
                           uri.Host.EndsWith(".use2.devtunnels.ms", StringComparison.OrdinalIgnoreCase) ||
                           uri.Host.EndsWith(".exp.direct", StringComparison.OrdinalIgnoreCase) ||
                           uri.Host.EndsWith(".azurewebsites.net", StringComparison.OrdinalIgnoreCase)
                       );
            })
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .WithExposedHeaders("Content-Type", "X-Total-Count");
    });
});

var app = builder.Build();

StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];

using (var scope = app.Services.CreateScope())
{
    await SeedHelper.MigrateAndSeed(scope.ServiceProvider);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.ConfigObject.AdditionalItems["withCredentials"] = true;
    });
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseRouting();

app.UseCors("AllowFrontendApps");

app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 200;
        await context.Response.CompleteAsync();
        return;
    }

    await next();
});

app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles();
app.MapControllers();

if (!app.Environment.IsDevelopment())
{
    app.MapFallbackToFile("/index.html");
}

app.Run();

public partial class Program { }