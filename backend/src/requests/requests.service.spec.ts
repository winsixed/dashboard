import { RequestsService } from './requests.service';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

// Simple in-memory mocks
const prismaMock = () => ({
  request: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  requestFlavor: {
    createMany: jest.fn(),
  },
});

describe('RequestsService', () => {
  let service: RequestsService;
  let prisma: ReturnType<typeof prismaMock>;
  let audit: { log: jest.Mock };

  beforeEach(() => {
    prisma = prismaMock() as any;
    audit = { log: jest.fn() } as any;
    service = new RequestsService(prisma as unknown as PrismaService, audit as unknown as AuditService);
  });

  it('findAll returns list of requests', async () => {
    const now = new Date();
    const requests = [
      {
        id: 1,
        status: 'NEW',
        comment: 'hello',
        createdAt: now,
        createdBy: { id: 2, firstName: 'John', lastName: 'Doe' },
        flavors: [ { flavor: { id: 3, name: 'Vanilla', brandId: 1 } } ],
      },
    ];
    (prisma.request.findMany as jest.Mock).mockResolvedValue(requests);

    const result = await service.list();

    expect(prisma.request.findMany).toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: 1,
        status: 'NEW',
        comment: 'hello',
        createdAt: now,
        createdBy: { id: 2, firstName: 'John', lastName: 'Doe' },
        flavors: [{ id: 3, name: 'Vanilla', brandId: 1 }],
      },
    ]);
  });

  it('create creates a new request', async () => {
    const dto: any = { comment: 'Need', flavorIds: [5, 6] };
    const request = { id: 10 };
    (prisma.request.create as jest.Mock).mockResolvedValue(request);
    (prisma.request.findUnique as jest.Mock).mockResolvedValue({ id: 10 });

    await service.create(dto, 7);

    expect(prisma.request.create).toHaveBeenCalledWith({
      data: { comment: dto.comment, createdById: 7 },
    });
    expect(prisma.requestFlavor.createMany).toHaveBeenCalledWith({
      data: [
        { requestId: 10, flavorId: 5 },
        { requestId: 10, flavorId: 6 },
      ],
    });
    expect(audit.log).toHaveBeenCalledWith('Request', 10, 'CREATE', 7, dto);
    expect(prisma.request.findUnique).toHaveBeenCalledWith({
      where: { id: 10 },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        flavors: { include: { flavor: { select: { id: true, name: true } } } },
      },
    });
  });
});
