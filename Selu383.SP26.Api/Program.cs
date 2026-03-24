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

builder.Services.ConfigureApplicationCookie(options =>
{
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
    options.AddPolicy("AllowMobileApp", policy =>
    {
        policy
            .WithOrigins(
                "https://cg6xt47n-8081.use2.devtunnels.ms",
                "https://cg6xt47n-7116.use2.devtunnels.ms",
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:7116",
                "http://localhost:8081",
                "http://localhost:8082",
                "http://localhost:8085")
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
    app.UseSwaggerUI();
}


app.UseCors("AllowMobileApp");

app.UseHttpsRedirection();

app.UseRouting();


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


app.MapControllers();

app.UseStaticFiles();

if(app.Environment.IsDevelopment())
{


}
else
{
    app.MapFallbackToFile("/index.html");
}

app.Run();

public partial class Program { }