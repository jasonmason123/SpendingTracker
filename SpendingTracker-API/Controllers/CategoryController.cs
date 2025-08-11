using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendingTracker_API.Repositories.UnitOfWork;
using SpendingTracker_API.Utils.Messages;
using SpendingTracker_API.DTOs.Web_Mobile;
using SpendingTracker_API.Entities;
using SpendingTracker_API.Utils;
using System.Linq.Expressions;
using X.PagedList;
using X.PagedList.Extensions;
using SpendingTracker_API.DTOs.EntityDtos;

namespace SpendingTracker_API.Controllers
{
    [ApiController, Route("api/categories"), Authorize]
    public class CategoryController : ControllerBase
    {
        private readonly IAppUnitOfWork _unitOfWork;

        public CategoryController(IAppUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetAsync(int id)
        {
            try
            {
                var category = await _unitOfWork.Categories.GetAsync(id);
                return Ok(new CategoryDto
                {
                    Id = category.Id,
                    Name = category.Name,
                    FlagDel = category.FlagDel,
                    CreatedAt = category.CreatedAt,
                    UpdatedAt = category.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: /get/{id} - {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpGet("get-list")]
        public ActionResult<PagedListResult<CategoryDto>> GetPagedList(
            [FromQuery] string? searchString,
            [FromQuery] int pageNumber = AppConst.DEFAULT_PAGE_NUMBER,
            [FromQuery] int pageSize = AppConst.DEFAULT_PAGE_SIZE
        )
        {
            try
            {
                IPagedList<Category> categoryList;
                Expression<Func<Category, Category>> categorySelector = selector => new Category
                {
                    Id = selector.Id,
                    Name = selector.Name,
                    FlagDel = selector.FlagDel,
                    CreatedAt = selector.CreatedAt,
                    UpdatedAt = selector.UpdatedAt
                };

                categoryList = _unitOfWork.Categories
                    .GetPagedList(pageNumber, pageSize, searchString, categorySelector);

                // Convert to DTOs
                var categoryDtoList = categoryList.Select(category => new CategoryDto
                {
                    Id = category.Id,
                    Name = category.Name,
                    FlagDel = category.FlagDel,
                    CreatedAt = category.CreatedAt,
                    UpdatedAt = category.UpdatedAt
                });

                // Create the paged result list
                var pagedListResult = new PagedListResult<CategoryDto>
                {
                    PageCount = categoryList.PageCount,
                    PageNumber = categoryList.PageNumber,
                    PageSize = categoryList.PageSize,
                    TotalItemCount = categoryList.TotalItemCount,
                    Items = categoryDtoList.ToList(),
                };

                return Ok(pagedListResult);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: /get-list - {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpGet("get-category-options")]
        public async Task<IActionResult> GetCategoryOptions()
        {
            try
            {
                var optionList = await _unitOfWork.Categories
                    .GetListAsync("", selector => new Category
                    {
                        Id = selector.Id,
                        Name = selector.Name,
                    });

                // Convert to DTOs
                var optionDtoList = optionList.Select(category => new
                {
                    Value = category.Id,
                    Label = category.Name,
                });

                return Ok(optionDtoList);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: /get-select-options - {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpPost("add")]
        public async Task<ActionResult<CategoryDto>> AddAsync([FromBody] CategoryDto categoryDto)
        {
            try
            {
                var category = new Category
                {
                    Name = categoryDto.Name,
                };

                await _unitOfWork.Categories.AddAsync(category);
                await _unitOfWork.SaveChangesAsync();

                return Ok(new CategoryDto
                {
                    Id = category.Id,
                    Name = category.Name,
                    FlagDel = category.FlagDel,
                    CreatedAt = category.CreatedAt,
                    UpdatedAt = category.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: /add - {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpPut("update/{id}")]
        public async Task<ActionResult<CategoryDto>> UpdateAsync(int id, [FromBody] CategoryDto categoryDto)
        {
            try
            {
                var category = new Category
                {
                    Id = id,
                    Name = categoryDto.Name
                };

                var updatedCategory = _unitOfWork.Categories.Update(category);
                await _unitOfWork.SaveChangesAsync();

                return Ok(new CategoryDto
                {
                    Id = updatedCategory.Id,
                    Name = updatedCategory.Name,
                    FlagDel = updatedCategory.FlagDel,
                    CreatedAt = updatedCategory.CreatedAt,
                    UpdatedAt = updatedCategory.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: /update/{id} - {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            try
            {
                var result = await _unitOfWork.Categories.ExecuteSoftDeleteAsync(id);

                if (result)
                    return NoContent();

                return BadRequest();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: /delete/{id} - {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }
    }
}
