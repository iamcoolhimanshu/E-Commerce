package com.ecommerce.project.controller;

import com.ecommerce.project.Dto.CategoryDto;
import com.ecommerce.project.Dto.CategoryResponse;
import com.ecommerce.project.config.AppConstants;
import com.ecommerce.project.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.tags.Tags;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Tag(name = "Category APIs", description = "APIs for managing category")
    @GetMapping("/public/categories")
    public ResponseEntity<CategoryResponse> getAllCategories( @RequestParam(name = "pageNumber",defaultValue = AppConstants.PAGE_NUMBER,required = false) Integer pageNumber,
                                                              @RequestParam(name = "pageSize",defaultValue = AppConstants.PAGE_SIZE,required = false) Integer pageSize,
                                                              @RequestParam(name="sortBy",defaultValue = AppConstants.SORT_CATEGORIES_BY,required = false) String sortBy,
                                                              @RequestParam(name = "sortOrder",defaultValue = AppConstants.SORT_DIR,required = false)String sortOrder ){
        CategoryResponse categoryResponse = categoryService.getAllCategories(pageNumber, pageSize,sortBy,sortOrder);
        return new ResponseEntity<>(categoryResponse, HttpStatus.OK);
    }

    @Tag(name = "Category APIs", description = "APIs for managing category")
    @Operation(summary = "Create Category",description = "API to create a new category")
    @ApiResponses({@ApiResponse(responseCode = "201" ,description = "Category is created successfully!!! "),
                   @ApiResponse(responseCode = "400" ,description = "Invalid Input ",content = @Content),
                   @ApiResponse(responseCode = "500", description = "Internal Server Error ")
    })
    @PostMapping("/public/categories")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryDto categoryDto) {
        CategoryDto savedCategoryDto = categoryService.createCategory(categoryDto);
        return new ResponseEntity<>(savedCategoryDto, HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/categories/{categoryId}")
    public ResponseEntity<CategoryDto> deleteCategory(@Parameter(description = "ID of the category that you wish to delete")
                                                          @PathVariable Long categoryId) {
        CategoryDto deletedCategory = categoryService.deleteCategory(categoryId);
        return new ResponseEntity<>(deletedCategory, HttpStatus.OK);
    }

    @PutMapping("/public/categories/{categoryId}")
    public ResponseEntity<CategoryDto> updateCategory(@Valid @RequestBody CategoryDto categoryDto, @PathVariable Long categoryId) {
        CategoryDto savedCategoryDto = categoryService.updateCategory(categoryDto, categoryId);
        return new ResponseEntity<>(savedCategoryDto, HttpStatus.OK);
    }
}
