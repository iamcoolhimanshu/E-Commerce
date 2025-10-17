package com.ecommerce.project.Dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryDto {

    @Schema(description = "Category ID",example = "101")
    private Long categoryId;
    @Schema(description = "category name for Category you wish to create",example = "Samsung s25")
    private String categoryName;
}
