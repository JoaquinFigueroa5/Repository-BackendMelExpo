import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1. Carreras
  await prisma.career.createMany({
    data: [
      { name: 'Computación e Informática', color: '#0A84FF', icon: '💻' },
      { name: 'Mecánica Automotriz', color: '#FF9F0A', icon: '⚙️' },
      { name: 'Electricidad y Electrónica', color: '#FFD60A', icon: '⚡' },
    ],
    skipDuplicates: true,
  })

  // 2. Categorías
  await prisma.category.createMany({
    data: [
      { name: 'Computación', icon: '💻', color: '#0A84FF' },
      { name: 'Mecánica', icon: '⚙️', color: '#FF9F0A' },
      { name: 'Electricidad', icon: '⚡', color: '#FFD60A' },
    ],
    skipDuplicates: true,
  })

  // 3. Talleres
  await prisma.workshop.createMany({
    data: [
      { name: 'Taller de Mecánica Automotriz', description: 'Taller principal de mecánica', location: 'Edificio A' },
      { name: 'Taller de Electricidad', description: 'Taller de electricidad y electrónica', location: 'Edificio B' },
    ],
    skipDuplicates: true,
  })

  // WorkshopCareer
  const mecWorkshop = await prisma.workshop.findFirst({ where: { name: 'Taller de Mecánica Automotriz' } })
  const elecWorkshop = await prisma.workshop.findFirst({ where: { name: 'Taller de Electricidad' } })

  if (mecWorkshop && elecWorkshop) {
    await prisma.workshopCareer.createMany({
      data: [
        { workshopId: mecWorkshop.id, careerName: 'Mecánica Automotriz' },
        { workshopId: elecWorkshop.id, careerName: 'Electricidad y Electrónica' },
        { workshopId: elecWorkshop.id, careerName: 'Computación e Informática' },
      ],
      skipDuplicates: true,
    })
  }

  // 4. Usuarios
  const password = await bcrypt.hash('123456', 10)

  await prisma.user.createMany({
    data: [
      {
        name: 'REMA',
        email: 'supportrema@gmail.com',
        password,
        career: 'Computación e Informática',
        role: 'ADMIN',
      },
      {
        name: 'Maestro/a',
        email: 'educacionvirtual@emilianisomascos.edu.gt',
        password,
        career: 'Computación e Informática',
        role: 'COORDINATOR',
      },
      {
        name: 'Clarence Hernandez',
        email: 'clarence.hernandez@emilianisomascos.edu.gt',
        password,
        career: 'Computación e Informática',
        role: 'STUDENT',
        carnet: '2024-12345',
      },
    ],
    skipDuplicates: true,
  })

  // 5. Herramientas (Rema.sql - Mecánica)
  const mecCat = 'Mecánica'
  const elecCat = 'Electricidad'
  const compCat = 'Computación'

  await prisma.tool.createMany({
    data: [
      { name: 'Gato Hidráulico', cat: mecCat, code: 'MEC-001', desc: 'Gato hidráulico de 2 toneladas', location: 'A1', totalQty: 3, available: 3, careers: ['Mecánica Automotriz'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Compresor de Aire', cat: mecCat, code: 'MEC-002', desc: 'Compresor de aire portátil', location: 'A2', totalQty: 2, available: 2, careers: ['Mecánica Automotriz'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Lubricador', cat: mecCat, code: 'MEC-003', desc: 'Lubricador neumático', location: 'A3', totalQty: 2, available: 2, careers: ['Mecánica Automotriz'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Filtro de Aire', cat: mecCat, code: 'MEC-004', desc: 'Filtro de aire para compresor', location: 'A4', totalQty: 3, available: 3, careers: ['Mecánica Automotriz'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Regulador de Presión', cat: mecCat, code: 'MEC-005', desc: 'Regulador de presión neumático', location: 'A5', totalQty: 2, available: 2, careers: ['Mecánica Automotriz'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Manguera Neumática', cat: mecCat, code: 'MEC-006', desc: 'Manguera para aire comprimido', location: 'A6', totalQty: 4, available: 4, careers: ['Mecánica Automotriz'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Acople Rápido', cat: mecCat, code: 'MEC-007', desc: 'Acople rápido neumático', location: 'A7', totalQty: 5, available: 5, careers: ['Mecánica Automotriz'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Válvula de Cierre', cat: mecCat, code: 'MEC-008', desc: 'Válvula de cierre para aire', location: 'A8', totalQty: 2, available: 2, careers: ['Mecánica Automotriz'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Cilindro Neumático', cat: mecCat, code: 'MEC-009', desc: 'Cilindro neumático de doble efecto', location: 'A9', totalQty: 2, available: 2, careers: ['Mecánica Automotriz'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Pistola de Aire', cat: mecCat, code: 'MEC-010', desc: 'Pistola de aire para limpieza', location: 'A10', totalQty: 3, available: 3, careers: ['Mecánica Automotriz'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Kit de Sellos', cat: mecCat, code: 'MEC-011', desc: 'Kit de sellos neumáticos', location: 'A11', totalQty: 2, available: 2, careers: ['Mecánica Automotriz'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Manómetro', cat: mecCat, code: 'MEC-012', desc: 'Manómetro para presión de aire', location: 'A12', totalQty: 3, available: 3, careers: ['Mecánica Automotriz'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Herramienta Eléctrica', cat: mecCat, code: 'MEC-013', desc: 'Herramienta eléctrica multifunción', location: 'A13', totalQty: 2, available: 2, careers: ['Mecánica Automotriz'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Juego de Dados', cat: mecCat, code: 'MEC-014', desc: 'Juego de dados métricos y estándar', location: 'A14', totalQty: 2, available: 2, careers: ['Mecánica Automotriz'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Llave de Impacto', cat: mecCat, code: 'MEC-015', desc: 'Llave de impacto neumática', location: 'A15', totalQty: 2, available: 2, careers: ['Mecánica Automotriz'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Cargador de Baterías', cat: elecCat, code: 'ELE-001', desc: 'Cargador de baterías de automóvil', location: 'B1', totalQty: 2, available: 2, careers: ['Electricidad y Electrónica'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Multímetro Digital', cat: elecCat, code: 'ELE-002', desc: 'Multímetro digital True RMS', location: 'B2', totalQty: 3, available: 3, careers: ['Electricidad y Electrónica', 'Computación e Informática'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Osciloscopio', cat: elecCat, code: 'ELE-003', desc: 'Osciloscopio digital de 2 canales', location: 'B3', totalQty: 1, available: 1, careers: ['Electricidad y Electrónica', 'Computación e Informática'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Fuente de Poder', cat: elecCat, code: 'ELE-004', desc: 'Fuente de poder variable 30V 5A', location: 'B4', totalQty: 2, available: 2, careers: ['Electricidad y Electrónica'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Generador de Señales', cat: elecCat, code: 'ELE-005', desc: 'Generador de señales DDS', location: 'B5', totalQty: 1, available: 1, careers: ['Electricidad y Electrónica'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Taladro Eléctrico', cat: elecCat, code: 'ELE-006', desc: 'Taladro eléctrico inalámbrico', location: 'B6', totalQty: 2, available: 2, careers: ['Electricidad y Electrónica'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Estación de Soldadura', cat: elecCat, code: 'ELE-007', desc: 'Estación de soldadura con temperatura controlada', location: 'B7', totalQty: 2, available: 2, careers: ['Electricidad y Electrónica', 'Computación e Informática'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Laptop Lenovo ThinkPad', cat: compCat, code: 'COM-001', desc: 'Laptop para programación y desarrollo', location: 'C1', totalQty: 5, available: 5, careers: ['Computación e Informática'], image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', maxDays: 14 },
      { name: 'Monitor Dell 24"', cat: compCat, code: 'COM-002', desc: 'Monitor Full HD 24 pulgadas', location: 'C2', totalQty: 4, available: 4, careers: ['Computación e Informática'], image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400', maxDays: 14 },
      { name: 'Teclado Mecánico', cat: compCat, code: 'COM-003', desc: 'Teclado mecánico RGB', location: 'C3', totalQty: 3, available: 3, careers: ['Computación e Informática'], image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400' },
      { name: 'Mouse Inalámbrico', cat: compCat, code: 'COM-004', desc: 'Mouse ergonómico inalámbrico', location: 'C4', totalQty: 5, available: 5, careers: ['Computación e Informática'], image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400' },
      { name: 'Hub USB 3.0', cat: compCat, code: 'COM-005', desc: 'Hub USB 3.0 de 4 puertos', location: 'C5', totalQty: 4, available: 4, careers: ['Computación e Informática'], image: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=400' },
      { name: 'Cable HDMI 2m', cat: compCat, code: 'COM-006', desc: 'Cable HDMI 2.0 de 2 metros', location: 'C6', totalQty: 6, available: 6, careers: ['Computación e Informática'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Webcam HD', cat: compCat, code: 'COM-007', desc: 'Cámara web 1080p', location: 'C7', totalQty: 3, available: 3, careers: ['Computación e Informática'], image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400' },
      { name: 'Audífonos con Micrófono', cat: compCat, code: 'COM-008', desc: 'Audífonos diadema con micrófono', location: 'C8', totalQty: 4, available: 4, careers: ['Computación e Informática'], image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400' },
      { name: 'Router WiFi', cat: compCat, code: 'COM-009', desc: 'Router WiFi 6 doble banda', location: 'C9', totalQty: 2, available: 2, careers: ['Computación e Informática'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Switch de Red 8 puertos', cat: compCat, code: 'COM-010', desc: 'Switch Gigabit 8 puertos', location: 'C10', totalQty: 2, available: 2, careers: ['Computación e Informática'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'UPS 1000VA', cat: compCat, code: 'COM-011', desc: 'UPS 1000VA para protección de equipos', location: 'C11', totalQty: 2, available: 2, careers: ['Computación e Informática'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
      { name: 'Disco Duro Externo 1TB', cat: compCat, code: 'COM-012', desc: 'Disco duro externo portátil 1TB', location: 'C12', totalQty: 3, available: 3, careers: ['Computación e Informática'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
    ],
    skipDuplicates: true,
  })

  // 6. Préstamos
  const student = await prisma.user.findFirst({ where: { email: 'clarence.hernandez@emilianisomascos.edu.gt' } })
  const laptop = await prisma.tool.findFirst({ where: { code: 'COM-001' } })
  const multimeter = await prisma.tool.findFirst({ where: { code: 'ELE-002' } })
  const jack = await prisma.tool.findFirst({ where: { code: 'MEC-001' } })
  const drill = await prisma.tool.findFirst({ where: { code: 'ELE-006' } })

  if (student && laptop && multimeter && jack && drill) {
    // Préstamo activo
    const loan1 = await prisma.loan.create({
      data: {
        userId: student.id,
        toolId: laptop.id,
        qty: 1,
        loanDate: new Date('2026-06-20'),
        dueDate: new Date('2026-07-04'),
        status: 'ACTIVE',
      },
    })
    await prisma.movement.create({ data: { loanId: loan1.id, userId: student.id, toolId: laptop.id, type: 'LOAN', description: 'Préstamo de laptop' } })

    // Préstamo devuelto
    const loan2 = await prisma.loan.create({
      data: {
        userId: student.id,
        toolId: multimeter.id,
        qty: 1,
        loanDate: new Date('2026-06-10'),
        dueDate: new Date('2026-06-17'),
        returnDate: new Date('2026-06-16'),
        status: 'RETURNED',
      },
    })
    await prisma.movement.create({ data: { loanId: loan2.id, userId: student.id, toolId: multimeter.id, type: 'LOAN', description: 'Préstamo de multímetro' } })
    await prisma.movement.create({ data: { loanId: loan2.id, userId: student.id, toolId: multimeter.id, type: 'RETURN', description: 'Devuelto el 16/06/2026' } })

    // Préstamo vencido
    const loan3 = await prisma.loan.create({
      data: {
        userId: student.id,
        toolId: jack.id,
        qty: 1,
        loanDate: new Date('2026-06-01'),
        dueDate: new Date('2026-06-08'),
        status: 'OVERDUE',
      },
    })
    await prisma.movement.create({ data: { loanId: loan3.id, userId: student.id, toolId: jack.id, type: 'LOAN', description: 'Préstamo de gato hidráulico' } })

    // Préstamo activo próximo a vencer
    const loan4 = await prisma.loan.create({
      data: {
        userId: student.id,
        toolId: drill.id,
        qty: 1,
        loanDate: new Date('2026-06-24'),
        dueDate: new Date('2026-06-28'),
        status: 'ACTIVE',
      },
    })
    await prisma.movement.create({ data: { loanId: loan4.id, userId: student.id, toolId: drill.id, type: 'LOAN', description: 'Préstamo de taladro' } })
  }

  // 7. Solicitudes
  const coordinator = await prisma.user.findFirst({ where: { role: 'COORDINATOR' } })
  const monitor = await prisma.tool.findFirst({ where: { code: 'COM-002' } })
  const keyboard = await prisma.tool.findFirst({ where: { code: 'COM-003' } })

  if (student && coordinator && laptop && monitor && keyboard) {
    // Solicitud aprobada
    const req1 = await prisma.request.create({
      data: {
        userId: student.id,
        status: 'APPROVED',
        reqDate: new Date('2026-06-19'),
        notes: 'Para proyecto final',
        items: {
          create: { toolId: laptop.id, qty: 1, startDate: new Date('2026-06-20'), dueDate: new Date('2026-07-04') },
        },
      },
    })
    await prisma.requestReview.create({
      data: { requestId: req1.id, coordinatorId: coordinator.id, action: 'APPROVED', reviewedAt: new Date('2026-06-19') },
    })

    // Solicitud pendiente
    await prisma.request.create({
      data: {
        userId: student.id,
        status: 'PENDING',
        reqDate: new Date('2026-06-25'),
        notes: 'Para prácticas de laboratorio',
        items: {
          create: { toolId: monitor.id, qty: 2, startDate: new Date('2026-06-28'), dueDate: new Date('2026-07-05') },
        },
      },
    })

    // Solicitud rechazada
    const req3 = await prisma.request.create({
      data: {
        userId: student.id,
        status: 'REJECTED',
        reqDate: new Date('2026-06-15'),
        items: {
          create: { toolId: keyboard.id, qty: 1, startDate: new Date('2026-06-16'), dueDate: new Date('2026-06-23') },
        },
      },
    })
    await prisma.requestReview.create({
      data: { requestId: req3.id, coordinatorId: coordinator.id, action: 'REJECTED', comment: 'Herramienta disponible solo en laboratorio', reviewedAt: new Date('2026-06-15') },
    })
  }

  // 8. Favoritos
  if (student && laptop && multimeter) {
    await prisma.favorite.createMany({
      data: [
        { userId: student.id, toolId: laptop.id },
        { userId: student.id, toolId: multimeter.id },
      ],
      skipDuplicates: true,
    })
  }

  // 9. Notificaciones de ejemplo
  if (student) {
    await prisma.notification.createMany({
      data: [
        { userId: student.id, title: 'Bienvenido a REMA', message: 'Tu cuenta ha sido creada exitosamente', type: 'INFO' },
        { userId: student.id, title: 'Préstamo próximo a vencer', message: 'Tu préstamo de Laptop Lenovo ThinkPad vence el 04/07/2026', type: 'REMINDER', link: '/account/loans' },
      ],
      skipDuplicates: true,
    })
  }

  // ────────────────────────────────────────────────────────────────
  // 10. Más estudiantes (password: 123456, mismo hash)
  // ────────────────────────────────────────────────────────────────
  await prisma.user.createMany({
    data: [
      {
        name: 'María López',
        email: 'maria.lopez@emilianisomascos.edu.gt',
        password,
        career: 'Mecánica Automotriz',
        role: 'STUDENT',
        carnet: '2024-67890',
      },
      {
        name: 'Pedro Ramírez',
        email: 'pedro.ramirez@emilianisomascos.edu.gt',
        password,
        career: 'Electricidad y Electrónica',
        role: 'STUDENT',
        carnet: '2024-54321',
      },
    ],
    skipDuplicates: true,
  })

  // ────────────────────────────────────────────────────────────────
  // 11. PasswordReset de prueba (código: 123456)
  // ────────────────────────────────────────────────────────────────
  await prisma.passwordReset.deleteMany({ where: { email: 'clarence.hernandez@emilianisomascos.edu.gt' } })
  await prisma.passwordReset.create({
    data: {
      email: 'clarence.hernandez@emilianisomascos.edu.gt',
      code: '123456',
      expiresAt: new Date(Date.now() + 3600_000),
      used: false,
    },
  })

  // ────────────────────────────────────────────────────────────────
  // 12. Más préstamos
  // ────────────────────────────────────────────────────────────────
  const maria = await prisma.user.findFirst({ where: { email: 'maria.lopez@emilianisomascos.edu.gt' } })
  const pedro = await prisma.user.findFirst({ where: { email: 'pedro.ramirez@emilianisomascos.edu.gt' } })
  const jackTool = await prisma.tool.findFirst({ where: { code: 'MEC-001' } })
  const manometer = await prisma.tool.findFirst({ where: { code: 'MEC-012' } })
  const multimeterTool = await prisma.tool.findFirst({ where: { code: 'ELE-002' } })
  const drillTool = await prisma.tool.findFirst({ where: { code: 'ELE-006' } })

  if (maria && jackTool && manometer) {
    const existing = await prisma.loan.findFirst({ where: { userId: maria.id, toolId: jackTool.id, status: 'ACTIVE' } })
    if (!existing) {
      const loan = await prisma.loan.create({
        data: {
          userId: maria.id, toolId: jackTool.id, qty: 1,
          loanDate: new Date('2026-06-22'), dueDate: new Date('2026-06-29'),
          status: 'ACTIVE',
        },
      })
      await prisma.movement.create({ data: { loanId: loan.id, userId: maria.id, toolId: jackTool.id, type: 'LOAN', description: 'Préstamo de gato hidráulico - María' } })
    }
    const returned = await prisma.loan.findFirst({ where: { userId: maria.id, toolId: manometer.id, status: 'RETURNED' } })
    if (!returned) {
      const loan = await prisma.loan.create({
        data: {
          userId: maria.id, toolId: manometer.id, qty: 1,
          loanDate: new Date('2026-06-15'), dueDate: new Date('2026-06-22'),
          returnDate: new Date('2026-06-21'), status: 'RETURNED',
        },
      })
      await prisma.movement.create({ data: { loanId: loan.id, userId: maria.id, toolId: manometer.id, type: 'LOAN', description: 'Préstamo de manómetro - María' } })
      await prisma.movement.create({ data: { loanId: loan.id, userId: maria.id, toolId: manometer.id, type: 'RETURN', description: 'Devuelto el 21/06/2026' } })
    }
  }

  if (pedro && multimeterTool) {
    const existing = await prisma.loan.findFirst({ where: { userId: pedro.id, toolId: multimeterTool.id, status: 'ACTIVE' } })
    if (!existing) {
      const loan = await prisma.loan.create({
        data: {
          userId: pedro.id, toolId: multimeterTool.id, qty: 1,
          loanDate: new Date('2026-06-25'), dueDate: new Date('2026-06-30'),
          status: 'ACTIVE',
        },
      })
      await prisma.movement.create({ data: { loanId: loan.id, userId: pedro.id, toolId: multimeterTool.id, type: 'LOAN', description: 'Préstamo de multímetro - Pedro' } })
    }
  }

  // ────────────────────────────────────────────────────────────────
  // 13. Más solicitudes
  // ────────────────────────────────────────────────────────────────
  if (maria && jackTool) {
    const existing = await prisma.request.findFirst({ where: { userId: maria.id, status: 'PENDING' } })
    if (!existing) {
      await prisma.request.create({
        data: {
          userId: maria.id, status: 'PENDING',
          reqDate: new Date('2026-06-26'),
          notes: 'Para prácticas de taller mecánico',
          items: { create: { toolId: jackTool.id, qty: 1, startDate: new Date('2026-06-29'), dueDate: new Date('2026-07-03') } },
        },
      })
    }
  }

  if (pedro && drillTool) {
    const existing = await prisma.request.findFirst({ where: { userId: pedro.id, status: 'PENDING' } })
    if (!existing) {
      await prisma.request.create({
        data: {
          userId: pedro.id, status: 'PENDING',
          reqDate: new Date('2026-06-27'),
          notes: 'Necesito el taladro para proyecto de electrónica',
          items: { create: { toolId: drillTool.id, qty: 1, startDate: new Date('2026-06-30'), dueDate: new Date('2026-07-04') } },
        },
      })
    }
  }

  // ────────────────────────────────────────────────────────────────
  // 14. Más favoritos
  // ────────────────────────────────────────────────────────────────
  const keyboardTool = await prisma.tool.findFirst({ where: { code: 'COM-003' } })
  const powerSupply = await prisma.tool.findFirst({ where: { code: 'ELE-004' } })

  if (student && keyboardTool) {
    await prisma.favorite.createMany({
      data: [{ userId: student.id, toolId: keyboardTool.id }],
      skipDuplicates: true,
    })
  }

  if (maria && jackTool && manometer) {
    await prisma.favorite.createMany({
      data: [
        { userId: maria.id, toolId: jackTool.id },
        { userId: maria.id, toolId: manometer.id },
      ],
      skipDuplicates: true,
    })
  }

  if (pedro && multimeterTool && powerSupply) {
    await prisma.favorite.createMany({
      data: [
        { userId: pedro.id, toolId: multimeterTool.id },
        { userId: pedro.id, toolId: powerSupply.id },
      ],
      skipDuplicates: true,
    })
  }

  // ────────────────────────────────────────────────────────────────
  // 15. Más notificaciones
  // ────────────────────────────────────────────────────────────────
  if (student) {
    await prisma.notification.createMany({
      data: [
        { userId: student.id, title: 'Solicitud Aprobada', message: 'Tu solicitud de Laptop Lenovo ThinkPad fue aprobada', type: 'INFO' },
        { userId: student.id, title: 'Préstamo Vencido', message: 'El gato hidráulico está vencido desde el 08/06/2026', type: 'ALERT', read: true },
      ],
      skipDuplicates: true,
    })
  }

  if (maria) {
    const existingNotif = await prisma.notification.findFirst({ where: { userId: maria.id, title: 'Bienvenido a REMA' } })
    if (!existingNotif) {
      await prisma.notification.createMany({
        data: [
          { userId: maria.id, title: 'Bienvenido a REMA', message: 'Tu cuenta ha sido creada exitosamente', type: 'INFO' },
          { userId: maria.id, title: 'Recordatorio', message: 'Tu préstamo de gato hidráulico vence el 29/06/2026', type: 'REMINDER', link: '/account/loans' },
        ],
      })
    }
  }

  // ────────────────────────────────────────────────────────────────
  // 16. Actualizar status de tools para variedad en dashboard
  // ────────────────────────────────────────────────────────────────
  await prisma.tool.updateMany({ where: { code: 'MEC-002' }, data: { status: 'MAINTENANCE' } })
  await prisma.tool.updateMany({ where: { code: 'ELE-003' }, data: { status: 'RESERVED' } })

  console.log('Seed completado exitosamente')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
