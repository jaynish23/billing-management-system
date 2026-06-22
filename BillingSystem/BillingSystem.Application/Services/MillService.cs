using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BillingSystem.Application.DTOs;
using BillingSystem.Application.Interfaces;
using BillingSystem.Application.Interfaces.Repositories;
using BillingSystem.Application.Interfaces.Services;
using BillingSystem.Domain.Entities;

namespace BillingSystem.Application.Services
{
    public class MillService : IMillService
    {
        private readonly IMillRepository _millRepository;
        private readonly ITranslationService _translationService;

        public MillService(IMillRepository millRepository, ITranslationService translationService)
        {
            _millRepository = millRepository;
            _translationService = translationService;
        }

        public async Task<(IEnumerable<MillDto> mills, int totalCount)> GetPagedMillsAsync(int pageNumber, int pageSize, string language)
        {
            var mills = await _millRepository.GetPagedAsync(pageNumber, pageSize, language);
            var totalCount = await _millRepository.GetTotalCountAsync();

            var list = mills.Select(m => MapToDto(m, language)).ToList();
            return (list, totalCount);
        }

        public async Task<MillDto> GetMillByIdAsync(int millNo, string language)
        {
            var mill = await _millRepository.GetByIdAsync(millNo);
            if (mill == null) return null;
            return MapToDto(mill, language);
        }

        public async Task<MillDto> CreateMillAsync(MillDto millDto)
        {
            var finalLanguage = millDto.InputLanguage ?? "en";
            
            var userMill = new UserMill
            {
                DistrictNo = millDto.DistrictNo,
                StateNo = millDto.StateNo,
                OwnerPhoneNo = millDto.OwnerPhoneNo,
                IsActive = millDto.IsActive,
                MillTaxInfo = millDto.MillTaxInfo
            };

            if (finalLanguage == "en")
            {
                userMill.MillName_en = millDto.MillName;
                userMill.OwnerName_en = millDto.OwnerName;
                userMill.Location_en = millDto.Location;
            }
            else if (finalLanguage == "hi")
            {
                userMill.MillName_hi = millDto.MillName;
                userMill.OwnerName_hi = millDto.OwnerName;
                userMill.Location_hi = millDto.Location;
            }
            else if (finalLanguage == "gu" || finalLanguage == "guj")
            {
                userMill.MillName_guj = millDto.MillName;
                userMill.OwnerName_guj = millDto.OwnerName;
                userMill.Location_guj = millDto.Location;
                finalLanguage = "gu"; 
            }

            await TranslateMissingFieldsAsync(userMill, finalLanguage);

            var created = await _millRepository.AddAsync(userMill);
            return MapToDto(created, finalLanguage);
        }

        public async Task UpdateMillAsync(int millNo, MillDto millDto)
        {
            var existingMill = await _millRepository.GetByIdAsync(millNo);
            if (existingMill == null) return;

            var finalLanguage = millDto.InputLanguage ?? "en";
            if (finalLanguage == "guj") finalLanguage = "gu";

            if (finalLanguage == "en")
            {
                existingMill.MillName_en = millDto.MillName;
                existingMill.OwnerName_en = millDto.OwnerName;
                existingMill.Location_en = millDto.Location;
            }
            else if (finalLanguage == "hi")
            {
                existingMill.MillName_hi = millDto.MillName;
                existingMill.OwnerName_hi = millDto.OwnerName;
                existingMill.Location_hi = millDto.Location;
            }
            else if (finalLanguage == "gu")
            {
                existingMill.MillName_guj = millDto.MillName;
                existingMill.OwnerName_guj = millDto.OwnerName;
                existingMill.Location_guj = millDto.Location;
            }

            existingMill.DistrictNo = millDto.DistrictNo;
            existingMill.StateNo = millDto.StateNo;
            existingMill.OwnerPhoneNo = millDto.OwnerPhoneNo;
            existingMill.IsActive = millDto.IsActive;
            existingMill.MillTaxInfo = millDto.MillTaxInfo;
            existingMill.UpdatedDate = DateTime.UtcNow;

            await TranslateMissingFieldsAsync(existingMill, finalLanguage);
            await _millRepository.UpdateAsync(existingMill);
        }

        public async Task DeleteMillAsync(int millNo)
        {
            await _millRepository.SoftDeleteAsync(millNo);
        }

        private async Task TranslateMissingFieldsAsync(UserMill mill, string inputLanguage)
        {
            try
            {
                if (inputLanguage == "en")
                {
                    mill.MillName_hi = await _translationService.TranslateAsync(mill.MillName_en, "en", "hi");
                    mill.MillName_guj = await _translationService.TranslateAsync(mill.MillName_en, "en", "gu");
                    
                    mill.OwnerName_hi = await _translationService.TranslateAsync(mill.OwnerName_en, "en", "hi");
                    mill.OwnerName_guj = await _translationService.TranslateAsync(mill.OwnerName_en, "en", "gu");
                    
                    if (!string.IsNullOrEmpty(mill.Location_en))
                    {
                        mill.Location_hi = await _translationService.TranslateAsync(mill.Location_en, "en", "hi");
                        mill.Location_guj = await _translationService.TranslateAsync(mill.Location_en, "en", "gu");
                    }
                }
                else if (inputLanguage == "hi")
                {
                    mill.MillName_en = await _translationService.TranslateAsync(mill.MillName_hi, "hi", "en");
                    mill.MillName_guj = await _translationService.TranslateAsync(mill.MillName_hi, "hi", "gu");

                    mill.OwnerName_en = await _translationService.TranslateAsync(mill.OwnerName_hi, "hi", "en");
                    mill.OwnerName_guj = await _translationService.TranslateAsync(mill.OwnerName_hi, "hi", "gu");
                    
                    if (!string.IsNullOrEmpty(mill.Location_hi))
                    {
                        mill.Location_en = await _translationService.TranslateAsync(mill.Location_hi, "hi", "en");
                        mill.Location_guj = await _translationService.TranslateAsync(mill.Location_hi, "hi", "gu");
                    }
                }
                else if (inputLanguage == "gu")
                {
                    mill.MillName_en = await _translationService.TranslateAsync(mill.MillName_guj, "gu", "en");
                    mill.MillName_hi = await _translationService.TranslateAsync(mill.MillName_guj, "gu", "hi");
                    
                    mill.OwnerName_en = await _translationService.TranslateAsync(mill.OwnerName_guj, "gu", "en");
                    mill.OwnerName_hi = await _translationService.TranslateAsync(mill.OwnerName_guj, "gu", "hi");
                    
                    if (!string.IsNullOrEmpty(mill.Location_guj))
                    {
                        mill.Location_en = await _translationService.TranslateAsync(mill.Location_guj, "gu", "en");
                        mill.Location_hi = await _translationService.TranslateAsync(mill.Location_guj, "gu", "hi");
                    }
                }
            }
            catch
            {
                if (string.IsNullOrEmpty(mill.MillName_en)) mill.MillName_en = mill.MillName_hi ?? mill.MillName_guj;
                if (string.IsNullOrEmpty(mill.MillName_hi)) mill.MillName_hi = mill.MillName_en ?? mill.MillName_guj;
                if (string.IsNullOrEmpty(mill.MillName_guj)) mill.MillName_guj = mill.MillName_en ?? mill.MillName_hi;

                if (string.IsNullOrEmpty(mill.OwnerName_en)) mill.OwnerName_en = mill.OwnerName_hi ?? mill.OwnerName_guj;
                if (string.IsNullOrEmpty(mill.OwnerName_hi)) mill.OwnerName_hi = mill.OwnerName_en ?? mill.OwnerName_guj;
                if (string.IsNullOrEmpty(mill.OwnerName_guj)) mill.OwnerName_guj = mill.OwnerName_en ?? mill.OwnerName_hi;

                if (string.IsNullOrEmpty(mill.Location_en)) mill.Location_en = mill.Location_hi ?? mill.Location_guj;
                if (string.IsNullOrEmpty(mill.Location_hi)) mill.Location_hi = mill.Location_en ?? mill.Location_guj;
                if (string.IsNullOrEmpty(mill.Location_guj)) mill.Location_guj = mill.Location_en ?? mill.Location_hi;
            }
        }

        private MillDto MapToDto(UserMill entity, string language)
        {
            var dto = new MillDto
            {
                MillNo = entity.MillNo,
                OwnerPhoneNo = entity.OwnerPhoneNo,
                DistrictNo = entity.DistrictNo,
                StateNo = entity.StateNo,
                MillTaxInfo = entity.MillTaxInfo,
                IsActive = entity.IsActive,
                InputLanguage = language
            };

            langNameResolver(language, entity, dto);

            if (entity.UserDistrict != null)
            {
                dto.DistrictName = ResolveDistrictName(entity.UserDistrict, language);
            }
            if (entity.UserState != null)
            {
                dto.StateName = ResolveStateName(entity.UserState, language);
            }

            return dto;
        }

        private void langNameResolver(string selectedLang, UserMill entity, MillDto dto)
        {
            if (selectedLang == "gu" || selectedLang == "guj")
            {
                dto.MillName = entity.MillName_guj ?? entity.MillName_en;
                dto.OwnerName = entity.OwnerName_guj ?? entity.OwnerName_en;
                dto.Location = entity.Location_guj ?? entity.Location_en;
            }
            else if (selectedLang == "hi")
            {
                dto.MillName = entity.MillName_hi ?? entity.MillName_en;
                dto.OwnerName = entity.OwnerName_hi ?? entity.OwnerName_en;
                dto.Location = entity.Location_hi ?? entity.Location_en;
            }
            else
            {
                dto.MillName = entity.MillName_en;
                dto.OwnerName = entity.OwnerName_en;
                dto.Location = entity.Location_en;
            }
        }

        private string ResolveDistrictName(UserDistrict district, string selectedLang)
        {
            if (selectedLang == "gu" || selectedLang == "guj")
                return district.DistrictName_guj ?? district.DistrictName_en;
            if (selectedLang == "hi")
                return district.DistrictName_hi ?? district.DistrictName_en;
            return district.DistrictName_en;
        }

        private string ResolveStateName(UserState state, string selectedLang)
        {
            if (selectedLang == "gu" || selectedLang == "guj")
                return state.StateName_guj ?? state.StateName_en;
            if (selectedLang == "hi")
                return state.StateName_hi ?? state.StateName_en;
            return state.StateName_en;
        }
    }
}
