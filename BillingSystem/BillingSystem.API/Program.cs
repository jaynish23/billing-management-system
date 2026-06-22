using System.Text;
using BillingSystem.Application.Interfaces;
using BillingSystem.Infrastructure.Services;
using BillingSystem.Infrastructure.DbContext;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Configure QuestPDF License
QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();

// Configure Database
builder.Services.AddDbContext<BillingDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure JWT Authentication
var jwtKey = builder.Configuration["JwtOptions:Key"];
if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("JwtOptions:Key is not configured.");
}
var jwtIssuer = builder.Configuration["JwtOptions:Issuer"];
var jwtAudience = builder.Configuration["JwtOptions:Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// Swagger with JWT Support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "BillingSystem.API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

// Configure CORS
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:5173" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Register Services
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<BillingSystem.Application.Interfaces.ICurrentUser, BillingSystem.API.Services.CurrentUserService>();
builder.Services.AddHttpClient<BillingSystem.Application.Interfaces.ITranslationService, BillingSystem.Infrastructure.Services.GoogleTranslationService>();

builder.Services.AddScoped<BillingSystem.Application.Interfaces.Repositories.IDukanRepository, BillingSystem.Infrastructure.Repositories.DukanRepository>();
builder.Services.AddScoped<BillingSystem.Application.Interfaces.Services.IDukanService, BillingSystem.Application.Services.DukanService>();

builder.Services.AddScoped<BillingSystem.Application.Interfaces.Repositories.IMillRepository, BillingSystem.Infrastructure.Repositories.MillRepository>();
builder.Services.AddScoped<BillingSystem.Application.Interfaces.Services.IMillService, BillingSystem.Application.Services.MillService>();

builder.Services.AddScoped<BillingSystem.Application.Interfaces.Repositories.IMarkoRepository, BillingSystem.Infrastructure.Repositories.MarkoRepository>();
builder.Services.AddScoped<BillingSystem.Application.Interfaces.Services.IMarkoService, BillingSystem.Application.Services.MarkoService>();

builder.Services.AddScoped<BillingSystem.Application.Interfaces.Repositories.ILedgerTransactionRepository, BillingSystem.Infrastructure.Repositories.LedgerTransactionRepository>();
builder.Services.AddScoped<BillingSystem.Application.Interfaces.Services.ILedgerTransactionService, BillingSystem.Application.Services.LedgerTransactionService>();
builder.Services.AddScoped<BillingSystem.Application.Interfaces.Repositories.IBillConfigurationRepository, BillingSystem.Infrastructure.Repositories.BillConfigurationRepository>();
builder.Services.AddScoped<BillingSystem.Application.Interfaces.Services.IBillConfigurationService, BillingSystem.Application.Services.BillConfigurationService>();
builder.Services.AddScoped<BillingSystem.Application.Interfaces.Services.IPdfService, BillingSystem.Infrastructure.Services.PdfService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
