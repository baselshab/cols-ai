import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantPlan } from '@prisma/client';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { _count: { select: { users: true, cases: true } } },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${id} not found`);
    }

    return tenant;
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with slug ${slug} not found`);
    }

    return tenant;
  }

  async create(data: { name: string; slug: string; plan?: TenantPlan }) {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new ConflictException('Tenant with this slug already exists');
    }

    return this.prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        plan: data.plan || TenantPlan.FREE,
      },
    });
  }

  async update(id: string, data: { name?: string; plan?: TenantPlan; settings?: Record<string, unknown> }) {
    await this.findById(id);

    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }

  async deactivate(id: string) {
    await this.findById(id);
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
