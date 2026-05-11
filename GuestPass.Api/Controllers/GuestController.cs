using Microsoft.AspNetCore.Mvc;
using GuestPass.Api.Data;
using GuestPass.Api.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace GuestPass.Api.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class GuestController : ControllerBase // Pastikan 'public' ada di sini
{
    private readonly AppDbContext _context;

    public GuestController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult<Guest>> PostGuest(Guest guest)
    {
        // Generate Token Unik 
        guest.QRCodeToken = "GP-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
        
        _context.Guests.Add(guest);
        await _context.SaveChangesAsync();

        return Ok(guest);
    }
}