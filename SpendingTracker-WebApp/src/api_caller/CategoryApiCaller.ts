import { Category, Option, PagedListResult } from "../types";
import { buildQueryString } from "../utils";

export async function fetchCategory(categoryId: number): Promise<Category> {
  return fetch(`/api/categories/${categoryId}`, {
    method: "GET",
    credentials: "include",
  }).then(async (response) => {
    if (!response.ok) throw new Error("Network response was not ok");
    const data = (await response.json()) as Category;
    return {
      ...data,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  });
}

export async function fetchCategoryPagedList(params: { searchString?: string; pageNumber: number; pageSize: number; }): Promise<PagedListResult<Category>> {
  const queryString = buildQueryString(params);
  return fetch(`/api/categories/get-list?${queryString}`, {
    method: "GET",
    credentials: "include",
  }).then(async (response) => {
    if (!response.ok) throw new Error("Network response was not ok");
    const data = (await response.json()) as PagedListResult<Category>;
    return {
      ...data,
      items: data.items.map((c) => ({
        ...c,
        createdAt: c.createdAt ? new Date(c.createdAt) : undefined,
        updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
      })),
    } as PagedListResult<Category>;
  });
}

export async function createCategory(category: Category): Promise<Category> {
  return fetch(`/api/categories/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(category),
  }).then(async (response) => {
    if (!response.ok) throw new Error("Network response was not ok");
    const data = (await response.json()) as Category;
    return {
      ...data,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  });
}

export async function updateCategory(category: Category): Promise<Category> {
  return fetch(`/api/categories/update/${category.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(category),
  }).then(async (response) => {
    if (!response.ok) throw new Error("Network response was not ok");
    const data = (await response.json()) as Category;
    return {
      ...data,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  });
}

export async function deleteCategory(categoryId: number): Promise<void> {
  return fetch(`/api/categories/delete/${categoryId}`, {
    method: "DELETE",
    credentials: "include",
  }).then((response) => {
    if (!response.ok) throw new Error("Network response was not ok");
  });
}

export async function fetchCategoryOptions(): Promise<Option[]> {
  return fetch("/api/categories/get-category-options", {
    method: "GET",
    credentials: "include",
  }).then(async (response) => {
    if (!response.ok) throw new Error("Network response was not ok");
    const data = (await response.json()) as Option[];
    return data;
  });
}