import { Injectable, Inject } from '@nestjs/common';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import {
  FindManyOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

export interface Paginated<T> {
  data: T[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
  links: {
    first: string;
    previous: string | null;
    next: string | null;
    last: string;
  };
}

@Injectable()
export class PaginationProvider {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  public async paginateQuery<T extends ObjectLiteral>(
    paginationQueryDto: PaginationQueryDto,
    repository: Repository<T>,
    // Giữ nguyên cấu trúc tham số của bạn
    where?: FindOptionsWhere<T>,
    relations?: string[],
  ): Promise<Paginated<T>> {
    const { page = 1, limit = 10 } = paginationQueryDto;

    // Xây dựng các tùy chọn truy vấn
    const findOptions: FindManyOptions<T> = {
      relations: relations,
      where: where,
      skip: (page - 1) * limit,
      take: limit,
    };

    // SỬA: Xóa các khối `if` không cần thiết ở đây vì `findOptions` đã được khởi tạo đúng.

    const [result, totalItems] = await Promise.all([
      repository.find(findOptions),
      repository.count({ where: where }), // Dòng này đã đúng
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const baseUrl = `${this.request.protocol}://${this.request.get('host')}${this.request.path}`;

    const createLink = (p: number) => {
        const params = new URLSearchParams();
        params.set('limit', String(limit));
        params.set('page', String(p));
        Object.entries(this.request.query).forEach(([key, value]) => {
            if (key !== 'page' && key !== 'limit') {
                params.set(key, String(value));
            }
        });
        return `${baseUrl}?${params.toString()}`;
    };

    const links = {
      first: createLink(1),
      previous: page > 1 ? createLink(page - 1) : null,
      next: page < totalPages ? createLink(page + 1) : null,
      last: totalPages > 0 ? createLink(totalPages) : createLink(1),
    };

    const response: Paginated<T> = {
      data: result,
      meta: {
        itemsPerPage: limit,
        totalItems: totalItems,
        currentPage: page,
        totalPages: totalPages,
      },
      links: links,
    };
    return response;
  }
}