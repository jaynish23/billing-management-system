using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BillingSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserStateTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserStates",
                columns: table => new
                {
                    StateNo = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StateCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    StateName_en = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    StateDescription_en = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    StateName_hi = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    StateDescription_hi = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    StateName_guj = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    StateDescription_guj = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserStates", x => x.StateNo);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserStates_StateCode",
                table: "UserStates",
                column: "StateCode",
                unique: true,
                filter: "[StateCode] IS NOT NULL");

            migrationBuilder.Sql("INSERT INTO [dbo].[UserMasterPages] (MasterPageId, MasterPageName_en, MasterPageName_hi, MasterPageName_guj, RouteUrl, IsActive, dCreatedOnDate) SELECT NEWID(), 'State', N'राज्य', N'રાજ્ય', '/state', 1, GETUTCDATE() WHERE NOT EXISTS(SELECT 1 FROM [dbo].[UserMasterPages] WHERE RouteUrl = '/state');");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM [dbo].[UserMasterPages] WHERE RouteUrl = '/state';");

            migrationBuilder.DropTable(
                name: "UserStates");
        }
    }
}
