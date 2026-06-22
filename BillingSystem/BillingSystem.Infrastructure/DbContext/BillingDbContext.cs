using BillingSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using BillingSystem.Application.Interfaces;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;

namespace BillingSystem.Infrastructure.DbContext
{
    public class BillingDbContext : Microsoft.EntityFrameworkCore.DbContext
    {
        private readonly ICurrentUser _currentUserService;

        public BillingDbContext(DbContextOptions<BillingDbContext> options, ICurrentUser currentUserService = null) : base(options)
        {
            _currentUserService = currentUserService;
        }

        public DbSet<User> Users { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<OtpInfo> OtpInfos { get; set; }
        public DbSet<UserMasterPage> UserMasterPages { get; set; }
        public DbSet<UserLoginDetails> UserLoginDetails { get; set; }
        public DbSet<UserDistrict> UserDistricts { get; set; }
        public DbSet<UserState> UserStates { get; set; }
        public DbSet<UserDukan> UserDukans { get; set; }
        public DbSet<UserMill> UserMills { get; set; }
        public DbSet<UserMarko> UserMarkos { get; set; }
        public DbSet<LedgerTransaction> LedgerTransactions { get; set; }
        public DbSet<AuditTableMst> AuditTableMsts { get; set; }
        public DbSet<BillConfiguration> BillConfigurations { get; set; }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var auditEntries = new List<(AuditTableMst Audit, Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry Entry)>();
            
            int? userNo = _currentUserService?.UserId;

            foreach (var entry in ChangeTracker.Entries().Where(e => e.Entity.GetType() != typeof(AuditTableMst) && e.Entity.GetType() != typeof(UserLoginDetails) && (e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted)))
            {
                if (entry.State == EntityState.Added)
                {
                    var createdByProp = entry.Entity.GetType().GetProperty("CreatedBy");
                    if (createdByProp != null && createdByProp.CanWrite) createdByProp.SetValue(entry.Entity, userNo);
                    var createdDateProp = entry.Entity.GetType().GetProperty("CreatedDate");
                    if (createdDateProp != null && createdDateProp.CanWrite) createdDateProp.SetValue(entry.Entity, DateTime.UtcNow);
                }
                else if (entry.State == EntityState.Modified)
                {
                    var updatedByProp = entry.Entity.GetType().GetProperty("UpdatedBy");
                    if (updatedByProp != null && updatedByProp.CanWrite) updatedByProp.SetValue(entry.Entity, userNo);
                    var updatedDateProp = entry.Entity.GetType().GetProperty("UpdatedDate");
                    if (updatedDateProp != null && updatedDateProp.CanWrite) updatedDateProp.SetValue(entry.Entity, DateTime.UtcNow);
                }

                var audit = new AuditTableMst
                {
                    AuditId = Guid.NewGuid(),
                    TableName = entry.Metadata.GetTableName(),
                    ActionType = entry.State == EntityState.Added ? "INSERT" : entry.State == EntityState.Deleted ? "DELETE" : "UPDATE",
                    UserNo = userNo,
                    CreatedDate = DateTime.UtcNow
                };

                var primaryKey = entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey());
                audit.RecordNo = primaryKey?.CurrentValue?.ToString();

                var oldValues = new Dictionary<string, object>();
                var newValues = new Dictionary<string, object>();

                foreach (var property in entry.Properties)
                {
                    if (property.IsTemporary) continue;

                    string propertyName = property.Metadata.Name;
                    
                    object GetFormattedValue(object val) {
                        if (propertyName.Equals("IsActive", StringComparison.OrdinalIgnoreCase) && val is bool b) {
                            return b ? "Active" : "Inactive";
                        }
                        return val;
                    }

                    if (entry.State == EntityState.Added)
                    {
                        newValues[propertyName] = GetFormattedValue(property.CurrentValue);
                    }
                    else if (entry.State == EntityState.Deleted)
                    {
                        oldValues[propertyName] = GetFormattedValue(property.OriginalValue);
                    }
                    else if (entry.State == EntityState.Modified)
                    {
                        if (property.IsModified && !Equals(property.OriginalValue, property.CurrentValue))
                        {
                            oldValues[propertyName] = GetFormattedValue(property.OriginalValue);
                            newValues[propertyName] = GetFormattedValue(property.CurrentValue);
                        }
                    }
                }

                if (entry.Entity is UserDistrict)
                {
                    string GetStateName(object stateNoObj)
                    {
                        if (stateNoObj != null && int.TryParse(stateNoObj.ToString(), out int stNo))
                        {
                            var state = UserStates.FirstOrDefault(s => s.StateNo == stNo);
                            return state?.StateName_en ?? stNo.ToString();
                        }
                        return "Unknown";
                    }

                    if (oldValues.ContainsKey("StateNo"))
                    {
                        oldValues["StateName"] = GetStateName(oldValues["StateNo"]);
                        oldValues.Remove("StateNo");
                    }
                    if (newValues.ContainsKey("StateNo"))
                    {
                        newValues["StateName"] = GetStateName(newValues["StateNo"]);
                        newValues.Remove("StateNo");
                    }
                }

                if (entry.Entity is UserDukan || entry.Entity is UserMill)
                {
                    string GetStateName(object stateNoObj)
                    {
                        if (stateNoObj != null && int.TryParse(stateNoObj.ToString(), out int stNo))
                        {
                            var state = UserStates.FirstOrDefault(s => s.StateNo == stNo);
                            return state?.StateName_en ?? stNo.ToString();
                        }
                        return "Unknown";
                    }

                    string GetDistrictName(object districtNoObj)
                    {
                        if (districtNoObj != null && int.TryParse(districtNoObj.ToString(), out int distNo))
                        {
                            var district = UserDistricts.FirstOrDefault(d => d.DistrictNo == distNo);
                            return district?.DistrictName_en ?? distNo.ToString();
                        }
                        return "Unknown";
                    }

                    if (oldValues.ContainsKey("StateNo"))
                    {
                        oldValues["StateName"] = GetStateName(oldValues["StateNo"]);
                        oldValues.Remove("StateNo");
                    }
                    if (newValues.ContainsKey("StateNo"))
                    {
                        newValues["StateName"] = GetStateName(newValues["StateNo"]);
                        newValues.Remove("StateNo");
                    }

                    if (oldValues.ContainsKey("DistrictNo"))
                    {
                        oldValues["DistrictName"] = GetDistrictName(oldValues["DistrictNo"]);
                        oldValues.Remove("DistrictNo");
                    }
                    if (newValues.ContainsKey("DistrictNo"))
                    {
                        newValues["DistrictName"] = GetDistrictName(newValues["DistrictNo"]);
                        newValues.Remove("DistrictNo");
                    }
                }

                if (entry.Entity is UserMarko)
                {
                    string GetMillName(object millNoObj)
                    {
                        if (millNoObj != null && int.TryParse(millNoObj.ToString(), out int mNo))
                        {
                            var mill = UserMills.FirstOrDefault(m => m.MillNo == mNo);
                            return mill?.MillName_en ?? mNo.ToString();
                        }
                        return "Unknown";
                    }

                    if (oldValues.ContainsKey("MillNo"))
                    {
                        oldValues["MillName"] = GetMillName(oldValues["MillNo"]);
                        oldValues.Remove("MillNo");
                    }
                    if (newValues.ContainsKey("MillNo"))
                    {
                        newValues["MillName"] = GetMillName(newValues["MillNo"]);
                        newValues.Remove("MillNo");
                    }
                }

                if (entry.State == EntityState.Modified && oldValues.Count == 0 && newValues.Count == 0) continue;

                if (oldValues.Count > 0)
                {
                    audit.OldValue = JsonSerializer.Serialize(oldValues);
                }

                if (newValues.Count > 0)
                {
                    audit.NewValue = JsonSerializer.Serialize(newValues);
                }

                auditEntries.Add((audit, entry));
            }

            int result = await base.SaveChangesAsync(cancellationToken);

            bool needsSecondSave = false;
            foreach (var item in auditEntries)
            {
                if (item.Audit.ActionType == "INSERT")
                {
                    var primaryKey = item.Entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey());
                    item.Audit.RecordNo = primaryKey?.CurrentValue?.ToString();
                }
                AuditTableMsts.Add(item.Audit);
                needsSecondSave = true;
            }

            if (needsSecondSave)
            {
                await base.SaveChangesAsync(cancellationToken);
            }

            return result;
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.vemailid).IsUnique();
                entity.HasIndex(e => e.MobileNumber).IsUnique();
                
                // Define alternate key to link UserRoles
                entity.HasAlternateKey(e => e.UserNo);
            });

            modelBuilder.Entity<UserDistrict>(entity =>
            {
                entity.HasIndex(e => new { e.DistrictCode, e.CreatedBy }).IsUnique();
                entity.HasOne(d => d.UserState)
                      .WithMany()
                      .HasForeignKey(d => d.StateNo);
            });

            modelBuilder.Entity<UserState>(entity =>
            {
                entity.HasIndex(e => new { e.StateCode, e.CreatedBy }).IsUnique();
            });

            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.HasOne(ur => ur.User)
                      .WithMany()
                      .HasPrincipalKey(u => u.UserNo)
                      .HasForeignKey(ur => ur.UserNo);
            });

            modelBuilder.Entity<BillConfiguration>(entity =>
            {
                entity.HasOne(bc => bc.User)
                      .WithMany()
                      .HasPrincipalKey(u => u.UserNo)
                      .HasForeignKey(bc => bc.UserNo)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserDukan>(entity =>
            {
                entity.HasIndex(e => e.DistrictNo);
                entity.HasIndex(e => e.StateNo);
                
                entity.HasOne(d => d.UserDistrict)
                      .WithMany()
                      .HasForeignKey(d => d.DistrictNo)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.UserState)
                      .WithMany()
                      .HasForeignKey(d => d.StateNo)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<UserMill>(entity =>
            {
                entity.HasIndex(e => e.DistrictNo);
                entity.HasIndex(e => e.StateNo);
                
                entity.HasOne(m => m.UserDistrict)
                      .WithMany()
                      .HasForeignKey(m => m.DistrictNo)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.UserState)
                      .WithMany()
                      .HasForeignKey(m => m.StateNo)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<UserMarko>(entity =>
            {
                entity.HasIndex(e => e.MillNo);
                
                entity.HasOne(m => m.UserMill)
                      .WithMany()
                      .HasForeignKey(m => m.MillNo)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<LedgerTransaction>(entity =>
            {
                entity.HasOne(t => t.UserMill)
                      .WithMany()
                      .HasForeignKey(t => t.MillNo)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(t => t.UserDukan)
                      .WithMany()
                      .HasForeignKey(t => t.DukanNo)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(t => t.UserMarko)
                      .WithMany()
                      .HasForeignKey(t => t.MarkoNo)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Global Query Filters for Multi-Tenancy Data Isolation
            modelBuilder.Entity<UserDistrict>().HasQueryFilter(e => !_currentUserService.UserId.HasValue || e.CreatedBy == _currentUserService.UserId);
            modelBuilder.Entity<UserState>().HasQueryFilter(e => !_currentUserService.UserId.HasValue || e.CreatedBy == _currentUserService.UserId);
            modelBuilder.Entity<UserMill>().HasQueryFilter(e => !_currentUserService.UserId.HasValue || e.CreatedBy == _currentUserService.UserId);
            modelBuilder.Entity<UserDukan>().HasQueryFilter(e => !_currentUserService.UserId.HasValue || e.CreatedBy == _currentUserService.UserId);
            modelBuilder.Entity<UserMarko>().HasQueryFilter(e => !_currentUserService.UserId.HasValue || e.CreatedBy == _currentUserService.UserId);
            modelBuilder.Entity<LedgerTransaction>().HasQueryFilter(e => !_currentUserService.UserId.HasValue || e.CreatedBy == _currentUserService.UserId);
            modelBuilder.Entity<BillConfiguration>().HasQueryFilter(e => !_currentUserService.UserId.HasValue || e.UserNo == _currentUserService.UserId);
        }
    }
}
