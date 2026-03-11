using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Receipts;
using Selu383.SP26.Api.Features.Payments;

using Stripe;

var builder = WebApplication.CreateBuilder(args);

// add services to the container.
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

var app = builder.Build();

// configure stripe with the secret key from appsettings
StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];

using (var scope = app.Services.CreateScope())
{
    await SeedHelper.MigrateAndSeed(scope.ServiceProvider);
}

// configure the http request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app
    .UseRouting()
    .UseAuthentication()
    .UseAuthorization()
    .UseEndpoints(x =>
    {
        x.MapControllers();
    });

app.UseStaticFiles();

if(app.Environment.IsDevelopment())
{
    app.UseSpa(x =>
    {
       x.UseProxyToSpaDevelopmentServer("http://localhost:5173");
    });
}
else
{
    app.MapFallbackToFile("/index.html");
}

app.Run();

public partial class Program { }