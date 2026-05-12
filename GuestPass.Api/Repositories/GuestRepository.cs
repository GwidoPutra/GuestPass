using Dapper;
using GuestPass.Api.DTOs;
using Npgsql;

namespace GuestPass.Api.Repositories;

public class GuestRepository : IGuestRepository
{
    private readonly string _connectionString;

    public GuestRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string not found.");
    }

    public async Task<IEnumerable<GuestResponse>> GetAllAsync()
    {
        const string sql = @"
            SELECT id AS Id, eventid AS EventId, name AS Name, email AS Email,
                   qrcodetoken AS QRCodeToken, ischeckedin AS IsCheckedIn,
                   checkedinat AS CheckedInAt, createdat AS CreatedAt
            FROM guests
            ORDER BY createdat DESC";

        await using var connection = new NpgsqlConnection(_connectionString);
        return await connection.QueryAsync<GuestResponse>(sql);
    }

    public async Task<IEnumerable<GuestResponse>> GetAllByEventAsync(Guid eventId)
    {
        const string sql = @"
            SELECT id AS Id, eventid AS EventId, name AS Name, email AS Email,
                   qrcodetoken AS QRCodeToken, ischeckedin AS IsCheckedIn,
                   checkedinat AS CheckedInAt, createdat AS CreatedAt
            FROM guests
            WHERE eventid = @EventId
            ORDER BY createdat DESC";

        await using var connection = new NpgsqlConnection(_connectionString);
        return await connection.QueryAsync<GuestResponse>(sql, new { EventId = eventId });
    }

    public async Task<GuestResponse?> GetByIdAsync(Guid id)
    {
        const string sql = @"
            SELECT id AS Id, eventid AS EventId, name AS Name, email AS Email,
                   qrcodetoken AS QRCodeToken, ischeckedin AS IsCheckedIn,
                   checkedinat AS CheckedInAt, createdat AS CreatedAt
            FROM guests
            WHERE id = @Id";

        await using var connection = new NpgsqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<GuestResponse>(sql, new { Id = id });
    }

    public async Task<GuestResponse?> GetByTokenAsync(string token)
    {
        const string sql = @"
            SELECT id AS Id, eventid AS EventId, name AS Name, email AS Email,
                   qrcodetoken AS QRCodeToken, ischeckedin AS IsCheckedIn,
                   checkedinat AS CheckedInAt, createdat AS CreatedAt
            FROM guests
            WHERE qrcodetoken = @Token";

        await using var connection = new NpgsqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<GuestResponse>(sql, new { Token = token });
    }
}
