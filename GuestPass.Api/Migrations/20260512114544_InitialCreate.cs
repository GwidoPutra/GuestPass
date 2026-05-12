using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GuestPass.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Enable uuid extension
            migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";");

            migrationBuilder.CreateTable(
                name: "profiles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "uuid_generate_v4()"),
                    username = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    passwordhash = table.Column<string>(type: "text", nullable: false),
                    fullname = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "text", nullable: true, defaultValueSql: "'panitia'"),
                    isapproved = table.Column<bool>(type: "boolean", nullable: false),
                    createdat = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_profiles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "events",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "uuid_generate_v4()"),
                    name = table.Column<string>(type: "text", nullable: false),
                    location = table.Column<string>(type: "text", nullable: false),
                    date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ownerid = table.Column<Guid>(type: "uuid", nullable: true),
                    createdat = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_events", x => x.id);
                    table.ForeignKey(
                        name: "FK_events_profiles_ownerid",
                        column: x => x.ownerid,
                        principalTable: "profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "guests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "uuid_generate_v4()"),
                    eventid = table.Column<Guid>(type: "uuid", nullable: true),
                    name = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    qrcodetoken = table.Column<string>(type: "text", nullable: false),
                    ischeckedin = table.Column<bool>(type: "boolean", nullable: false),
                    checkedinat = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    createdat = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_guests", x => x.id);
                    table.ForeignKey(
                        name: "FK_guests_events_eventid",
                        column: x => x.eventid,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "event_moments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "uuid_generate_v4()"),
                    event_id = table.Column<Guid>(type: "uuid", nullable: true),
                    profile_id = table.Column<Guid>(type: "uuid", nullable: true),
                    guest_id = table.Column<Guid>(type: "uuid", nullable: true),
                    content = table.Column<string>(type: "text", nullable: true),
                    image_url = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_event_moments", x => x.id);
                    table.ForeignKey(
                        name: "FK_event_moments_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_event_moments_guests_guest_id",
                        column: x => x.guest_id,
                        principalTable: "guests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_event_moments_profiles_profile_id",
                        column: x => x.profile_id,
                        principalTable: "profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_event_moments_event_id",
                table: "event_moments",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "IX_event_moments_guest_id",
                table: "event_moments",
                column: "guest_id");

            migrationBuilder.CreateIndex(
                name: "IX_event_moments_profile_id",
                table: "event_moments",
                column: "profile_id");

            migrationBuilder.CreateIndex(
                name: "IX_events_ownerid",
                table: "events",
                column: "ownerid");

            migrationBuilder.CreateIndex(
                name: "IX_guests_eventid",
                table: "guests",
                column: "eventid");

            migrationBuilder.CreateIndex(
                name: "IX_guests_qrcodetoken",
                table: "guests",
                column: "qrcodetoken",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_profiles_email",
                table: "profiles",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_profiles_username",
                table: "profiles",
                column: "username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "event_moments");

            migrationBuilder.DropTable(
                name: "guests");

            migrationBuilder.DropTable(
                name: "events");

            migrationBuilder.DropTable(
                name: "profiles");
        }
    }
}
