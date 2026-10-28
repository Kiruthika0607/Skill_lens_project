package com.skilllens.common.util;

import com.skilllens.common.dto.PagedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Utility helpers for Spring Data pagination.
 */
public final class PaginationUtil {

    private PaginationUtil() {}

    public static Pageable toPageable(int page, int size, String sortBy, String direction) {
        Sort sort = Sort.by(
                "DESC".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortBy
        );
        return PageRequest.of(Math.max(0, page), Math.min(100, Math.max(1, size)), sort);
    }

    public static <T> PagedResponse<T> toPagedResponse(Page<T> page) {
        return toPagedResponse(page, Function.identity());
    }

    public static <S, T> PagedResponse<T> toPagedResponse(Page<S> page, Function<S, T> mapper) {
        List<T> content = page.getContent().stream().map(mapper).collect(Collectors.toList());
        return PagedResponse.<T>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
