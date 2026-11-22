package com.orderflow.product.service;

import com.orderflow.common.dto.PageResponse;
import com.orderflow.product.dto.request.ProductRequest;
import com.orderflow.product.dto.response.ProductResponse;

import java.math.BigDecimal;
import java.util.UUID;

public interface ProductService {
    PageResponse<ProductResponse> searchProducts(
            String search, UUID categoryId, BigDecimal minPrice, BigDecimal maxPrice,
            String brand, int page, int size, String sortBy, String sortDir);

    ProductResponse getProductById(UUID id);
    ProductResponse getProductBySlug(String slug);
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(UUID id, ProductRequest request);
    void deleteProduct(UUID id);
}
