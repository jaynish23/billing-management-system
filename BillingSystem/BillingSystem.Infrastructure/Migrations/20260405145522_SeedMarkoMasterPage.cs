using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BillingSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedMarkoMasterPage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM UserMasterPages WHERE RouteUrl = '/marko')
                BEGIN
                    INSERT INTO UserMasterPages (MasterPageId, MasterPageName_en, MasterPageName_hi, MasterPageName_guj, RouteUrl, IsActive, dCreatedOnDate)
                    VALUES (NEWID(), 'Marko Master', N'मार्को मास्टर', N'માર્કો માસ્ટર', '/marko', 1, GETUTCDATE());
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM UserMasterPages WHERE RouteUrl = '/marko'");
        }
    }
}
