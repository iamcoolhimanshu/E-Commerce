package com.ecommerce.project.service;

import com.ecommerce.project.Dto.CategoryDto;
import com.ecommerce.project.Dto.CategoryResponse;
import com.ecommerce.project.entity.Category;

import java.util.List;

public interface CategoryService {

    CategoryResponse getAllCategories(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    CategoryDto createCategory(CategoryDto categoryDto);

    CategoryDto deleteCategory(Long categoryId);

    CategoryDto updateCategory(CategoryDto categoryDto, Long categoryId);
}
