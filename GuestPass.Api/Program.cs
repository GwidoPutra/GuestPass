using Microsoft.EntityFrameworkCore;
using GuestPass.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Tambahkan servis agar Controller terdeteksi
builder.Services.AddControllers(); 

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Aktifkan route Controller (Auth, Event, dll)
app.MapControllers(); 

app.Run();