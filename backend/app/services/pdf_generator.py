# EDGE PDF Report Generator - Professional certification report
import io
from datetime import datetime, timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.platypus.flowables import Flowable

# ═══ Colors ═══
SLATE_900 = colors.HexColor("#0f172a")
SLATE_700 = colors.HexColor("#334155")
SLATE_500 = colors.HexColor("#64748b")
SLATE_300 = colors.HexColor("#cbd5e1")
SLATE_200 = colors.HexColor("#e2e8f0")
SLATE_100 = colors.HexColor("#f1f5f9")
SLATE_50 = colors.HexColor("#f8fafc")
SKY_600 = colors.HexColor("#0284c7")
SKY_50 = colors.HexColor("#f0f9ff")
EMERALD_600 = colors.HexColor("#059669")
EMERALD_50 = colors.HexColor("#ecfdf5")
AMBER_600 = colors.HexColor("#d97706")
AMBER_50 = colors.HexColor("#fffbeb")
RED_600 = colors.HexColor("#dc2626")
RED_50 = colors.HexColor("#fef2f2")
WHITE = colors.white

CATEGORY_COLORS = {
    "ENERGY": SKY_600,
    "WATER": colors.HexColor("#2563eb"),
    "MATERIALS": AMBER_600,
    "DESIGN": EMERALD_600,
}


class ColorBar(Flowable):
    """A thin colored bar flowable."""
    def __init__(self, width, height, color):
        Flowable.__init__(self)
        self.width = width
        self.height = height
        self.color = color

    def draw(self):
        self.canv.setFillColor(self.color)
        self.canv.rect(0, 0, self.width, self.height, fill=1, stroke=0)


def _build_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='ReportTitle', fontName='Helvetica-Bold', fontSize=22,
        leading=28, textColor=SLATE_900, spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        name='ReportSubtitle', fontName='Helvetica', fontSize=11,
        leading=16, textColor=SLATE_500, spaceAfter=20,
    ))
    styles.add(ParagraphStyle(
        name='SectionTitle', fontName='Helvetica-Bold', fontSize=13,
        leading=18, textColor=SLATE_900, spaceBefore=16, spaceAfter=8,
    ))
    styles.add(ParagraphStyle(
        name='SubSection', fontName='Helvetica-Bold', fontSize=10,
        leading=14, textColor=SLATE_700, spaceBefore=10, spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        name='BodyText2', fontName='Helvetica', fontSize=9,
        leading=13, textColor=SLATE_700,
    ))
    styles.add(ParagraphStyle(
        name='SmallMuted', fontName='Helvetica', fontSize=8,
        leading=11, textColor=SLATE_500,
    ))
    styles.add(ParagraphStyle(
        name='KpiValue', fontName='Helvetica-Bold', fontSize=18,
        leading=22, textColor=SLATE_900, alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        name='KpiLabel', fontName='Helvetica', fontSize=8,
        leading=11, textColor=SLATE_500, alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        name='AlertText', fontName='Helvetica', fontSize=9,
        leading=13, textColor=RED_600,
    ))
    styles.add(ParagraphStyle(
        name='TableHeader', fontName='Helvetica-Bold', fontSize=8,
        leading=11, textColor=WHITE, alignment=TA_LEFT,
    ))
    styles.add(ParagraphStyle(
        name='TableCell', fontName='Helvetica', fontSize=8,
        leading=11, textColor=SLATE_700,
    ))
    styles.add(ParagraphStyle(
        name='TableCellMono', fontName='Courier', fontSize=8,
        leading=11, textColor=SLATE_700,
    ))
    return styles


def _header_footer(canvas, doc, project_name):
    canvas.saveState()
    # Header line
    canvas.setStrokeColor(SLATE_200)
    canvas.setLineWidth(0.5)
    canvas.line(20 * mm, A4[1] - 15 * mm, A4[0] - 20 * mm, A4[1] - 15 * mm)
    # Header text
    canvas.setFont('Helvetica-Bold', 7)
    canvas.setFillColor(SLATE_500)
    canvas.drawString(20 * mm, A4[1] - 13 * mm, "EDGE CERTIFICATION REPORT")
    canvas.setFont('Helvetica', 7)
    canvas.drawRightString(A4[0] - 20 * mm, A4[1] - 13 * mm, project_name)
    # Footer
    canvas.setStrokeColor(SLATE_200)
    canvas.line(20 * mm, 15 * mm, A4[0] - 20 * mm, 15 * mm)
    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(SLATE_500)
    canvas.drawString(20 * mm, 10 * mm, f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    canvas.drawRightString(A4[0] - 20 * mm, 10 * mm, f"Pagina {doc.page}")
    canvas.restoreState()


def _make_table_style(has_header=True):
    style = [
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (0, 0), (-1, -1), SLATE_700),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, SLATE_200),
    ]
    if has_header:
        style.extend([
            ('BACKGROUND', (0, 0), (-1, 0), SLATE_900),
            ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 8),
        ])
    # Zebra striping
    for i in range(1, 100, 2):
        style.append(('BACKGROUND', (0, i), (-1, i), SLATE_50))
    return TableStyle(style)


def generate_edge_report(project: dict, files: list, validation: dict, kpis: dict) -> io.BytesIO:
    """Generate professional EDGE certification PDF report."""
    buffer = io.BytesIO()
    styles = _build_styles()

    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=22 * mm, bottomMargin=22 * mm,
    )

    story = []
    page_width = A4[0] - 40 * mm

    # ═══════════════════════════════════════
    # COVER / HEADER
    # ═══════════════════════════════════════
    story.append(ColorBar(page_width, 4, SLATE_900))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Reporte de Certificacion EDGE", styles['ReportTitle']))
    story.append(Paragraph(
        f"{project['name']} &mdash; {project.get('typology', '').capitalize()}",
        styles['ReportSubtitle']
    ))

    # Project info table
    processed_files = [f for f in files if f.get("status") == "processed"]
    measures_data = validation.get("measures", {})
    coverage = validation.get("coverage", {})
    coverage_pct = coverage.get("coverage_percent", 0)

    total_measures = len(measures_data)
    complete_measures = sum(1 for v in measures_data.values() if v.get("estado") == "completo")
    incomplete_measures = total_measures - complete_measures

    info_data = [
        ["Proyecto", project["name"]],
        ["Tipologia", project.get("typology", "-").capitalize()],
        ["Fecha de Generacion", datetime.now().strftime("%d/%m/%Y %H:%M")],
        ["Total Archivos", str(len(files))],
        ["Archivos Procesados", str(len(processed_files))],
        ["Medidas Evaluadas", str(total_measures)],
    ]
    info_table = Table(info_data, colWidths=[page_width * 0.35, page_width * 0.65])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (0, -1), SLATE_500),
        ('TEXTCOLOR', (1, 0), (1, -1), SLATE_900),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, SLATE_200),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 16))

    # ═══════════════════════════════════════
    # RESUMEN GENERAL
    # ═══════════════════════════════════════
    story.append(ColorBar(page_width, 2, SLATE_900))
    story.append(Paragraph("1. Resumen General", styles['SectionTitle']))

    # Status determination
    if total_measures == 0:
        status_text = "Sin Evaluar"
        status_color = SLATE_500
    elif complete_measures == total_measures:
        status_text = "Completo"
        status_color = EMERALD_600
    elif complete_measures > 0:
        status_text = "En Progreso"
        status_color = AMBER_600
    else:
        status_text = "Incompleto"
        status_color = RED_600

    compliance_pct = round((complete_measures / total_measures) * 100) if total_measures else 0

    # KPI summary boxes
    kpi_cells = [
        [Paragraph("Cobertura", styles['KpiLabel']),
         Paragraph("Cumplimiento", styles['KpiLabel']),
         Paragraph("Estado", styles['KpiLabel']),
         Paragraph("Medidas", styles['KpiLabel'])],
        [Paragraph(f"{coverage_pct}%", styles['KpiValue']),
         Paragraph(f"{compliance_pct}%", styles['KpiValue']),
         Paragraph(status_text, ParagraphStyle('StatusVal', parent=styles['KpiValue'], textColor=status_color)),
         Paragraph(f"{complete_measures}/{total_measures}", styles['KpiValue'])],
    ]
    kpi_table = Table(kpi_cells, colWidths=[page_width / 4] * 4, rowHeights=[14, 30])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), SLATE_50),
        ('BOX', (0, 0), (-1, -1), 0.5, SLATE_200),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, SLATE_200),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 8))

    # Category breakdown
    cat_labels = {"ENERGY": "Energia", "WATER": "Agua", "MATERIALS": "Materiales", "DESIGN": "Diseno"}
    cat_data_rows = [["Categoria", "Detectadas", "Total", "Medidas"]]
    for cat_key, cat_label in cat_labels.items():
        cat_info = coverage.get("categories", {}).get(cat_key, {})
        cat_data_rows.append([
            cat_label,
            str(cat_info.get("detected", 0)),
            str(cat_info.get("total", 0)),
            ", ".join(cat_info.get("measures", [])) or "-",
        ])

    cat_table = Table(cat_data_rows, colWidths=[page_width * 0.2, page_width * 0.15, page_width * 0.12, page_width * 0.53])
    cat_table.setStyle(_make_table_style())
    story.append(cat_table)
    story.append(Spacer(1, 12))

    # ═══════════════════════════════════════
    # TABLA POR MEDIDA EDGE
    # ═══════════════════════════════════════
    story.append(ColorBar(page_width, 2, SLATE_900))
    story.append(Paragraph("2. Estado por Medida EDGE", styles['SectionTitle']))

    if measures_data:
        wbs_header = ["Medida", "Categoria", "Nombre", "Estado", "Progreso", "Faltantes"]
        wbs_rows = [wbs_header]
        for measure, data in sorted(measures_data.items()):
            estado = data.get("estado", "-")
            progreso = f"{int(data.get('progreso', 0) * 100)}%"
            faltantes = ", ".join(data.get("faltantes", [])) or "-"
            wbs_rows.append([
                measure,
                data.get("categoria", "-"),
                data.get("nombre", "-"),
                estado.upper(),
                progreso,
                faltantes,
            ])

        wbs_table = Table(wbs_rows, colWidths=[
            page_width * 0.10, page_width * 0.13, page_width * 0.27,
            page_width * 0.13, page_width * 0.10, page_width * 0.27
        ])
        base_style = _make_table_style()
        # Color-code status cells
        for i, row in enumerate(wbs_rows[1:], 1):
            if row[3] == "COMPLETO":
                base_style.add('TEXTCOLOR', (3, i), (3, i), EMERALD_600)
                base_style.add('FONTNAME', (3, i), (3, i), 'Helvetica-Bold')
            elif row[3] == "INCOMPLETO":
                base_style.add('TEXTCOLOR', (3, i), (3, i), RED_600)
                base_style.add('FONTNAME', (3, i), (3, i), 'Helvetica-Bold')
        wbs_table.setStyle(base_style)
        story.append(wbs_table)
    else:
        story.append(Paragraph("No se han detectado medidas EDGE en los archivos procesados.", styles['BodyText2']))

    story.append(Spacer(1, 12))

    # ═══════════════════════════════════════
    # KPIs POR MEDIDA
    # ═══════════════════════════════════════
    if kpis:
        story.append(ColorBar(page_width, 2, SLATE_900))
        story.append(Paragraph("3. KPIs por Medida", styles['SectionTitle']))

        for measure, kpi in kpis.items():
            kpi_name = kpi.get("nombre", measure)
            valor = kpi.get("valor", 0)
            unidad = kpi.get("unidad", "")
            umbral = kpi.get("umbral_edge")
            cumple = kpi.get("cumple")

            story.append(Paragraph(f"{measure} — {kpi_name}", styles['SubSection']))

            kpi_info = [[
                f"Valor: {valor} {unidad}",
                f"Umbral EDGE: {umbral} {unidad}" if umbral else "-",
                "CUMPLE" if cumple else ("NO CUMPLE" if cumple is False else "-"),
            ]]
            kpi_t = Table(kpi_info, colWidths=[page_width * 0.35, page_width * 0.35, page_width * 0.30])
            kstyle = TableStyle([
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('TEXTCOLOR', (0, 0), (1, -1), SLATE_700),
                ('BACKGROUND', (0, 0), (-1, -1), SLATE_50),
                ('BOX', (0, 0), (-1, -1), 0.5, SLATE_200),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, SLATE_200),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ])
            if cumple is True:
                kstyle.add('TEXTCOLOR', (2, 0), (2, 0), EMERALD_600)
                kstyle.add('FONTNAME', (2, 0), (2, 0), 'Helvetica-Bold')
            elif cumple is False:
                kstyle.add('TEXTCOLOR', (2, 0), (2, 0), RED_600)
                kstyle.add('FONTNAME', (2, 0), (2, 0), 'Helvetica-Bold')
            kpi_t.setStyle(kstyle)
            story.append(kpi_t)

            # Alerts
            for alert in kpi.get("alertas", [])[:5]:
                story.append(Paragraph(f"  ! {alert}", styles['AlertText']))

            story.append(Spacer(1, 6))

        story.append(Spacer(1, 6))

    # ═══════════════════════════════════════
    # EVIDENCIA - Documentos por Medida
    # ═══════════════════════════════════════
    section_num = 4 if kpis else 3
    story.append(ColorBar(page_width, 2, SLATE_900))
    story.append(Paragraph(f"{section_num}. Evidencia Documental", styles['SectionTitle']))

    # Group files by measure
    files_by_measure = {}
    for f in processed_files:
        m = f.get("measure_edge", "SIN MEDIDA")
        if m not in files_by_measure:
            files_by_measure[m] = []
        files_by_measure[m].append(f)

    if files_by_measure:
        for measure in sorted(files_by_measure.keys()):
            measure_files = files_by_measure[measure]
            story.append(Paragraph(f"{measure}", styles['SubSection']))

            evidence_rows = [["Archivo", "Tipo Documento", "Confianza"]]
            for f in measure_files:
                doc_type = (f.get("doc_type") or "otro").replace("_", " ").capitalize()
                conf = f.get("confidence")
                conf_str = f"{int(conf * 100)}%" if conf is not None else "-"
                evidence_rows.append([f.get("filename", "-"), doc_type, conf_str])

            ev_table = Table(evidence_rows, colWidths=[page_width * 0.55, page_width * 0.25, page_width * 0.20])
            ev_table.setStyle(_make_table_style())
            story.append(ev_table)
            story.append(Spacer(1, 6))
    else:
        story.append(Paragraph("No hay documentos procesados.", styles['BodyText2']))

    story.append(Spacer(1, 12))

    # ═══════════════════════════════════════
    # EEM22 LUMINAIRE DETAIL (if present)
    # ═══════════════════════════════════════
    eem22_files = [f for f in processed_files if f.get("measure_edge") in ("EEM22", "EEM23") and f.get("specialized_data")]
    if eem22_files:
        section_num += 1
        story.append(ColorBar(page_width, 2, SKY_600))
        story.append(Paragraph(f"{section_num}. Detalle EEM22 — Tabla de Luminarias", styles['SectionTitle']))

        for f in eem22_files:
            sd = f.get("specialized_data", {})
            story.append(Paragraph(f"Fuente: {f['filename']}", styles['SmallMuted']))

            lum_rows = [["ID", "Modelo", "Cant.", "Lumens", "Watts", "lm/W"]]
            for lum in sd.get("luminarias", []):
                lum_rows.append([
                    str(lum.get("id", "-")),
                    str(lum.get("modelo", "-")),
                    str(lum.get("cantidad", 0)),
                    str(lum.get("lumens", 0)),
                    str(lum.get("watts", 0)),
                    str(lum.get("eficiencia", 0)),
                ])

            lum_table = Table(lum_rows, colWidths=[
                page_width * 0.10, page_width * 0.30, page_width * 0.10,
                page_width * 0.15, page_width * 0.15, page_width * 0.20,
            ])
            lum_table.setStyle(_make_table_style())
            story.append(lum_table)

            # Summary
            eficacia = sd.get("eficacia_global", 0)
            cumple = sd.get("cumple_edge", False)
            summary_text = (
                f"Total Lumens: {sd.get('total_lumens', 0):,.0f} | "
                f"Total Watts: {sd.get('total_watts', 0):,.0f} | "
                f"Eficacia Global: {eficacia} lm/W | "
                f"{'CUMPLE EDGE' if cumple else 'NO CUMPLE EDGE (umbral: 90 lm/W)'}"
            )
            summary_style = ParagraphStyle(
                'EEM22Summary', parent=styles['BodyText2'],
                textColor=EMERALD_600 if cumple else RED_600,
                fontName='Helvetica-Bold', fontSize=9,
            )
            story.append(Spacer(1, 4))
            story.append(Paragraph(summary_text, summary_style))
            story.append(Spacer(1, 10))

    # ═══════════════════════════════════════
    # ALERTAS
    # ═══════════════════════════════════════
    incomplete = [(m, d) for m, d in measures_data.items() if d.get("estado") == "incompleto"]
    if incomplete:
        section_num += 1
        story.append(ColorBar(page_width, 2, AMBER_600))
        story.append(Paragraph(f"{section_num}. Alertas de Documentacion", styles['SectionTitle']))

        alert_rows = [["Medida", "Categoria", "Documentos Faltantes"]]
        for measure, data in sorted(incomplete):
            faltantes = ", ".join(f.replace("_", " ").capitalize() for f in data.get("faltantes", []))
            alert_rows.append([measure, data.get("categoria", "-"), faltantes or "-"])

        alert_table = Table(alert_rows, colWidths=[page_width * 0.15, page_width * 0.20, page_width * 0.65])
        astyle = _make_table_style()
        astyle.add('BACKGROUND', (0, 0), (-1, 0), AMBER_600)
        alert_table.setStyle(astyle)
        story.append(alert_table)
        story.append(Spacer(1, 8))
        story.append(Paragraph(
            f"Se detectaron {len(incomplete)} medida(s) con documentacion incompleta. "
            "Se recomienda completar los documentos faltantes antes de la revision final.",
            styles['BodyText2']
        ))

    # ═══════════════════════════════════════
    # FOOTER / SIGNATURE SPACE
    # ═══════════════════════════════════════
    story.append(Spacer(1, 30))
    story.append(HRFlowable(width=page_width, thickness=0.5, color=SLATE_300))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "Este reporte fue generado automaticamente por EDGE Document Processor. "
        "Los datos presentados provienen del analisis de IA y deben ser verificados por un consultor certificado.",
        styles['SmallMuted']
    ))

    # Build PDF
    project_name = project.get("name", "Proyecto EDGE")
    doc.build(
        story,
        onFirstPage=lambda c, d: _header_footer(c, d, project_name),
        onLaterPages=lambda c, d: _header_footer(c, d, project_name),
    )

    buffer.seek(0)
    return buffer
