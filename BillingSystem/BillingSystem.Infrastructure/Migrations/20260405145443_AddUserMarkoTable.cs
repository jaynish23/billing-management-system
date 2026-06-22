using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BillingSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserMarkoTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserMarkos",
                columns: table => new
                {
                    MarkoNo = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MarkoName_en = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    MarkoName_hi = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    MarkoName_guj = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    MillNo = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserMarkos", x => x.MarkoNo);
                    table.ForeignKey(
                        name: "FK_UserMarkos_UserMills_MillNo",
                        column: x => x.MillNo,
                        principalTable: "UserMills",
                        principalColumn: "MillNo",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserMarkos_MillNo",
                table: "UserMarkos",
                column: "MillNo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserMarkos");
        }
    }
}
