using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BillingSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedDukanMasterPage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("INSERT INTO [UserMasterPages] ([MasterPageId], [MasterPageName_en], [MasterPageName_hi], [MasterPageName_guj], [RouteUrl], [IsActive], [dCreatedOnDate]) VALUES (NEWID(), 'Dukan Master', N'दुकान मास्टर', N'દુકાન માસ્ટર', '/dukan', 1, GETUTCDATE())");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM [UserMasterPages] WHERE [RouteUrl] = '/dukan'");
        }
    }
}
