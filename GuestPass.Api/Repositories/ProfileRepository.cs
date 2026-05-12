using Dapper;
using GuestPass.Api.DTOs;
using Npgsql;

namespace GuestPass.Api.Repositories;

public class ProfileRepository : IProfileRepository
{
    private readonly string _connectionString;

    public ProfileRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string not found.");
    }

    public async Task<IEnumerable<ProfileResponse>> GetAllAsync()
    {
        const string sql = @"
            SELECT id AS Id, username AS Username, email AS Email, 
                   fullname AS FullName, role AS Role, 
                   isapproved AS IsApproved, createdat AS CreatedAt
            FROM profiles
            ORDER BY createdat DESC";

        await using var connection = new NpgsqlConnection(_connectionString);
        return await connection.QueryAsync<ProfileResponse>(sql);
    }

    public async Task<ProfileResponse?> GetByIdAsync(Guid id)
    {
        const string sql = @"
            SELECT id AS Id, username AS Username, email AS Email, 
                   fullname AS FullName, role AS Role, 
                   isapproved AS IsApproved, createdat AS CreatedAt
            FROM profiles
            WHERE id = @Id";

        await using var connection = new NpgsqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<ProfileResponse>(sql, new { Id = id });
    }
}
