package com.orderflow.product.controller;

import com.orderflow.common.dto.ApiResponse;
import com.orderflow.product.dto.request.CategoryRequest;
import com.orderflow.product.dto.request.ProductRequest;
import com.orderflow.product.dto.response.CategoryResponse;
import com.orderflow.product.dto.response.ProductResponse;
import com.orderflow.product.service.CategoryService;
import com.orderflow.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Catalog Management", description = "Admin CRUD operations for products and categories")
public class AdminProductController {

    private final ProductService productService;
    private final CategoryService categoryService;

    @PostMapping("/products")
    @Operation(summary = "Admin: Create product")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Product created successfully", response));
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "Admin: Update product")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Product updated successfully", response));
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Admin: Soft delete product")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("Product deactivated successfully"));
    }

    @PostMapping("/categories")
    @Operation(summary = "Admin: Create category")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Category created successfully", response));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Admin: Update category")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Category updated successfully", response));
    }
}
