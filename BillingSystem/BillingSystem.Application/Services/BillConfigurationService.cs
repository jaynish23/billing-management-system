using System;
using System.Threading.Tasks;
using BillingSystem.Application.DTOs;
using BillingSystem.Application.Interfaces.Repositories;
using BillingSystem.Application.Interfaces.Services;
using BillingSystem.Domain.Entities;

namespace BillingSystem.Application.Services
{
    public class BillConfigurationService : IBillConfigurationService
    {
        private readonly IBillConfigurationRepository _repository;

        public BillConfigurationService(IBillConfigurationRepository repository)
        {
            _repository = repository;
        }

        public async Task<BillConfigurationDto?> GetByUserIdAsync(int userId)
        {
            var entity = await _repository.GetByUserNoAsync(userId);
            if (entity == null) return null;

            return MapToDto(entity);
        }

        public async Task<BillConfigurationDto> SaveAsync(int userId, BillConfigurationDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));
            if (string.IsNullOrWhiteSpace(dto.GSTNumber)) throw new ArgumentException("GST Number is required.");
            if (string.IsNullOrWhiteSpace(dto.BankAccountNumber)) throw new ArgumentException("Bank Account Number is required.");

            var entity = await _repository.GetByUserNoAsync(userId);
            if (entity == null)
            {
                entity = new BillConfiguration
                {
                    BillConfigurationId = Guid.NewGuid(),
                    UserNo = userId,
                    GSTNumber = dto.GSTNumber.Trim(),
                    BankAccountNumber = dto.BankAccountNumber.Trim(),
                    PANNumber = dto.PANNumber?.Trim(),
                    LeftImagePath = dto.LeftImagePath,
                    RightImagePath = dto.RightImagePath,
                    QRCodeImagePath = dto.QRCodeImagePath,
                    CreatedDate = DateTime.UtcNow,
                    IsActive = true
                };
                await _repository.AddAsync(entity);
            }
            else
            {
                entity.GSTNumber = dto.GSTNumber.Trim();
                entity.BankAccountNumber = dto.BankAccountNumber.Trim();
                entity.PANNumber = dto.PANNumber?.Trim();
                entity.LeftImagePath = dto.LeftImagePath;
                entity.RightImagePath = dto.RightImagePath;
                entity.QRCodeImagePath = dto.QRCodeImagePath;
                entity.ModifiedDate = DateTime.UtcNow;
                await _repository.UpdateAsync(entity);
            }

            return MapToDto(entity);
        }

        private BillConfigurationDto MapToDto(BillConfiguration entity)
        {
            return new BillConfigurationDto
            {
                BillConfigurationId = entity.BillConfigurationId,
                UserNo = entity.UserNo,
                GSTNumber = entity.GSTNumber,
                BankAccountNumber = entity.BankAccountNumber,
                PANNumber = entity.PANNumber,
                LeftImagePath = entity.LeftImagePath,
                RightImagePath = entity.RightImagePath,
                QRCodeImagePath = entity.QRCodeImagePath,
                CreatedDate = entity.CreatedDate,
                ModifiedDate = entity.ModifiedDate,
                IsActive = entity.IsActive
            };
        }
    }
}
