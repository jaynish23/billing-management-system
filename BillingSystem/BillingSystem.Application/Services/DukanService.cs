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
    public class DukanService : IDukanService
    {
        private readonly IDukanRepository _dukanRepository;
        private readonly ITranslationService _translationService;

        public DukanService(IDukanRepository dukanRepository, ITranslationService translationService)
        {
            _dukanRepository = dukanRepository;
            _translationService = translationService;
        }

        public async Task<(IEnumerable<DukanDto> dukans, int totalCount)> GetPagedDukansAsync(int pageNumber, int pageSize, string language)
        {
            var dukans = await _dukanRepository.GetPagedAsync(pageNumber, pageSize, language);
            var totalCount = await _dukanRepository.GetTotalCountAsync();

            var list = dukans.Select(d => MapToDto(d, language)).ToList();
            return (list, totalCount);
        }

        public async Task<DukanDto> GetDukanByIdAsync(int dukanNo, string language)
        {
            var dukan = await _dukanRepository.GetByIdAsync(dukanNo);
            if (dukan == null) return null;
            return MapToDto(dukan, language);
        }

        public async Task<DukanDto> CreateDukanAsync(DukanDto dukanDto)
        {
            var finalLanguage = dukanDto.InputLanguage ?? "en";
            
            var userDukan = new UserDukan
            {
                DistrictNo = dukanDto.DistrictNo,
                StateNo = dukanDto.StateNo,
                OwnerPhoneNo = dukanDto.OwnerPhoneNo,
                IsActive = dukanDto.IsActive,
                DukanTaxInfo = dukanDto.DukanTaxInfo
            };

            // Set default language values
            if (finalLanguage == "en")
            {
                userDukan.DukanName_en = dukanDto.DukanName;
                userDukan.OwnerName_en = dukanDto.OwnerName;
                userDukan.Location_en = dukanDto.Location;
            }
            else if (finalLanguage == "hi")
            {
                userDukan.DukanName_hi = dukanDto.DukanName;
                userDukan.OwnerName_hi = dukanDto.OwnerName;
                userDukan.Location_hi = dukanDto.Location;
            }
            else if (finalLanguage == "gu" || finalLanguage == "guj")
            {
                userDukan.DukanName_guj = dukanDto.DukanName;
                userDukan.OwnerName_guj = dukanDto.OwnerName;
                userDukan.Location_guj = dukanDto.Location;
                finalLanguage = "gu"; // match google translate code
            }

            await TranslateMissingFieldsAsync(userDukan, finalLanguage);

            var created = await _dukanRepository.AddAsync(userDukan);
            return MapToDto(created, finalLanguage);
        }

        public async Task UpdateDukanAsync(int dukanNo, DukanDto dukanDto)
        {
            var existingDukan = await _dukanRepository.GetByIdAsync(dukanNo);
            if (existingDukan == null) return;

            var finalLanguage = dukanDto.InputLanguage ?? "en";
            if (finalLanguage == "guj") finalLanguage = "gu";

            // Only update fields for input language provided
            if (finalLanguage == "en")
            {
                existingDukan.DukanName_en = dukanDto.DukanName;
                existingDukan.OwnerName_en = dukanDto.OwnerName;
                existingDukan.Location_en = dukanDto.Location;
            }
            else if (finalLanguage == "hi")
            {
                existingDukan.DukanName_hi = dukanDto.DukanName;
                existingDukan.OwnerName_hi = dukanDto.OwnerName;
                existingDukan.Location_hi = dukanDto.Location;
            }
            else if (finalLanguage == "gu")
            {
                existingDukan.DukanName_guj = dukanDto.DukanName;
                existingDukan.OwnerName_guj = dukanDto.OwnerName;
                existingDukan.Location_guj = dukanDto.Location;
            }

            existingDukan.DistrictNo = dukanDto.DistrictNo;
            existingDukan.StateNo = dukanDto.StateNo;
            existingDukan.OwnerPhoneNo = dukanDto.OwnerPhoneNo;
            existingDukan.IsActive = dukanDto.IsActive;
            existingDukan.DukanTaxInfo = dukanDto.DukanTaxInfo;
            existingDukan.UpdatedDate = DateTime.UtcNow;

            await TranslateMissingFieldsAsync(existingDukan, finalLanguage);
            await _dukanRepository.UpdateAsync(existingDukan);
        }

        public async Task DeleteDukanAsync(int dukanNo)
        {
            await _dukanRepository.SoftDeleteAsync(dukanNo);
        }

        private async Task TranslateMissingFieldsAsync(UserDukan dukan, string inputLanguage)
        {
            try
            {
                if (inputLanguage == "en")
                {
                    dukan.DukanName_hi = await _translationService.TranslateAsync(dukan.DukanName_en, "en", "hi");
                    dukan.DukanName_guj = await _translationService.TranslateAsync(dukan.DukanName_en, "en", "gu");
                    
                    dukan.OwnerName_hi = await _translationService.TranslateAsync(dukan.OwnerName_en, "en", "hi");
                    dukan.OwnerName_guj = await _translationService.TranslateAsync(dukan.OwnerName_en, "en", "gu");
                    
                    if (!string.IsNullOrEmpty(dukan.Location_en))
                    {
                        dukan.Location_hi = await _translationService.TranslateAsync(dukan.Location_en, "en", "hi");
                        dukan.Location_guj = await _translationService.TranslateAsync(dukan.Location_en, "en", "gu");
                    }
                }
                else if (inputLanguage == "hi")
                {
                    dukan.DukanName_en = await _translationService.TranslateAsync(dukan.DukanName_hi, "hi", "en");
                    dukan.DukanName_guj = await _translationService.TranslateAsync(dukan.DukanName_hi, "hi", "gu");

                    dukan.OwnerName_en = await _translationService.TranslateAsync(dukan.OwnerName_hi, "hi", "en");
                    dukan.OwnerName_guj = await _translationService.TranslateAsync(dukan.OwnerName_hi, "hi", "gu");
                    
                    if (!string.IsNullOrEmpty(dukan.Location_hi))
                    {
                        dukan.Location_en = await _translationService.TranslateAsync(dukan.Location_hi, "hi", "en");
                        dukan.Location_guj = await _translationService.TranslateAsync(dukan.Location_hi, "hi", "gu");
                    }
                }
                else if (inputLanguage == "gu")
                {
                    dukan.DukanName_en = await _translationService.TranslateAsync(dukan.DukanName_guj, "gu", "en");
                    dukan.DukanName_hi = await _translationService.TranslateAsync(dukan.DukanName_guj, "gu", "hi");
                    
                    dukan.OwnerName_en = await _translationService.TranslateAsync(dukan.OwnerName_guj, "gu", "en");
                    dukan.OwnerName_hi = await _translationService.TranslateAsync(dukan.OwnerName_guj, "gu", "hi");
                    
                    if (!string.IsNullOrEmpty(dukan.Location_guj))
                    {
                        dukan.Location_en = await _translationService.TranslateAsync(dukan.Location_guj, "gu", "en");
                        dukan.Location_hi = await _translationService.TranslateAsync(dukan.Location_guj, "gu", "hi");
                    }
                }
            }
            catch
            {
                // Fallback: If translation fails, copy original language value into other columns to prevent NULL constraints
                if (string.IsNullOrEmpty(dukan.DukanName_en)) dukan.DukanName_en = dukan.DukanName_hi ?? dukan.DukanName_guj;
                if (string.IsNullOrEmpty(dukan.DukanName_hi)) dukan.DukanName_hi = dukan.DukanName_en ?? dukan.DukanName_guj;
                if (string.IsNullOrEmpty(dukan.DukanName_guj)) dukan.DukanName_guj = dukan.DukanName_en ?? dukan.DukanName_hi;

                if (string.IsNullOrEmpty(dukan.OwnerName_en)) dukan.OwnerName_en = dukan.OwnerName_hi ?? dukan.OwnerName_guj;
                if (string.IsNullOrEmpty(dukan.OwnerName_hi)) dukan.OwnerName_hi = dukan.OwnerName_en ?? dukan.OwnerName_guj;
                if (string.IsNullOrEmpty(dukan.OwnerName_guj)) dukan.OwnerName_guj = dukan.OwnerName_en ?? dukan.OwnerName_hi;

                if (string.IsNullOrEmpty(dukan.Location_en)) dukan.Location_en = dukan.Location_hi ?? dukan.Location_guj;
                if (string.IsNullOrEmpty(dukan.Location_hi)) dukan.Location_hi = dukan.Location_en ?? dukan.Location_guj;
                if (string.IsNullOrEmpty(dukan.Location_guj)) dukan.Location_guj = dukan.Location_en ?? dukan.Location_hi;
            }
        }

        private DukanDto MapToDto(UserDukan entity, string language)
        {
            var dto = new DukanDto
            {
                DukanNo = entity.DukanNo,
                OwnerPhoneNo = entity.OwnerPhoneNo,
                DistrictNo = entity.DistrictNo,
                StateNo = entity.StateNo,
                IsActive = entity.IsActive,
                DukanTaxInfo = entity.DukanTaxInfo,
                InputLanguage = language
            };

            // Selected Language names
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

        private void langNameResolver(string selectedLang, UserDukan entity, DukanDto dto)
        {
            if (selectedLang == "gu" || selectedLang == "guj")
            {
                dto.DukanName = entity.DukanName_guj ?? entity.DukanName_en;
                dto.OwnerName = entity.OwnerName_guj ?? entity.OwnerName_en;
                dto.Location = entity.Location_guj ?? entity.Location_en;
            }
            else if (selectedLang == "hi")
            {
                dto.DukanName = entity.DukanName_hi ?? entity.DukanName_en;
                dto.OwnerName = entity.OwnerName_hi ?? entity.OwnerName_en;
                dto.Location = entity.Location_hi ?? entity.Location_en;
            }
            else
            {
                dto.DukanName = entity.DukanName_en;
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
