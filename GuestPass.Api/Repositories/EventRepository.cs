using Dapper;
using GuestPass.Api.DTOs;
using Npgsql;

namespace GuestPass.Api.Repositories;

public class EventRepository : IEventRepository
{
    private readonly string _connectionString;

    public EventRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string not found.");
    }

    public async Task<IEnumerable<EventResponse>> GetAllByOwnerAsync(Guid ownerId)
    {
        const string sql = @"
            SELECT id AS Id, name AS Name, location AS Location, 
                   date AS Date, ownerid AS CreatedBy, createdat AS CreatedAt
            FROM events
            WHERE ownerid = @OwnerId
            ORDER BY createdat DESC";

        await using var connection = new NpgsqlConnection(_connectionString);
        return await connection.QueryAsync<EventResponse>(sql, new { OwnerId = ownerId });
    }

    public async Task<EventResponse?> GetByIdAsync(Guid id)
    {
        const string sql = @"
            SELECT id AS Id, name AS Name, location AS Location, 
                   date AS Date, ownerid AS CreatedBy, createdat AS CreatedAt
            FROM events
            WHERE id = @Id";

        await using var connection = new NpgsqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<EventResponse>(sql, new { Id = id });
    }
}
