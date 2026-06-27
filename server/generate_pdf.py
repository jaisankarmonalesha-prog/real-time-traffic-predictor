import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def build_pdf(filename="MetroFlow_AI_Project_Details.pdf"):
    # Create the document
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    # Styles
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=12
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#64748b'),
        spaceAfter=24
    )
    
    h1_style = ParagraphStyle(
        'H1Style',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#1e3a8a'),
        spaceBefore=14,
        spaceAfter=10,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'H2Style',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1e40af'),
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8
    )

    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=body_style,
        leftIndent=20,
        firstLineIndent=-10,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor('#0f172a'),
        backColor=colors.HexColor('#f1f5f9'),
        borderPadding=6,
        spaceAfter=8
    )

    story = []
    
    # --- PAGE 1: TITLE & EXECUTIVE SUMMARY ---
    story.append(Paragraph("MetroFlow AI", title_style))
    story.append(Paragraph("Full-Stack Tamil Nadu State Traffic Twin & Congestion Predictor", subtitle_style))
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("1. Executive Summary", h1_style))
    story.append(Paragraph(
        "<b>MetroFlow AI</b> is a production-grade, full-stack virtual twin traffic modeling dashboard representing "
        "the major state highway corridors and key transit nodes of Tamil Nadu, India. The application simulates vehicular "
        "dynamics, handles stochastic road incidents (e.g. accidents, construction blockages), and executes machine "
        "learning algorithms on the server to forecast gridlock levels.",
        body_style
    ))
    story.append(Paragraph(
        "The project demonstrates frontend react architectures, high-fidelity responsive dashboard design, vector-based SVG graphics, "
        "asynchronous Python web APIs, database ORM integrations, and predictive statistical modelling.",
        body_style
    ))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("2. Scope & Geographic Coverage", h1_style))
    story.append(Paragraph(
        "The simulation maps major real-world transit endpoints across the Tamil Nadu state road grid:",
        body_style
    ))
    story.append(Paragraph("• <b>Chennai (CHN):</b> Capital transit hub hosting highest vehicular density.", bullet_style))
    story.append(Paragraph("• <b>Vellore (VEL):</b> Major northern entry link connecting industrial corridors.", bullet_style))
    story.append(Paragraph("• <b>Salem (SAL):</b> Central state highway interchange corridor.", bullet_style))
    story.append(Paragraph("• <b>Coimbatore (CBE):</b> Western industrial hub with high freight volumes.", bullet_style))
    story.append(Paragraph("• <b>Trichy (TRY):</b> Geographical center nexus linking south and north traffic flows.", bullet_style))
    story.append(Paragraph("• <b>Madurai (MDU):</b> Cultural and transit gateway connecting southern districts.", bullet_style))
    story.append(Paragraph("• <b>Tirunelveli (TNV):</b> Southern corridor gateway routing to national expressways.", bullet_style))
    
    story.append(PageBreak())
    
    # --- PAGE 2: SYSTEM ARCHITECTURE ---
    story.append(Paragraph("3. System Architecture", h1_style))
    story.append(Paragraph(
        "MetroFlow AI is designed as a multi-tier decoupled web application:",
        body_style
    ))
    
    # Simple ASCII Architecture Table
    arch_data = [
        ["Layer", "Technology", "Role & Description"],
        ["Frontend UI", "React, TypeScript, Vite", "Renders glassmorphism map dashboard, controls, Recharts trends."],
        ["Backend API", "FastAPI (Python)", "Serves REST routes, manages DB transactions, triggers ML model."],
        ["Database", "SQLite, SQLAlchemy ORM", "Stores history logs and active incidents list. Run as local file."],
        ["AI / ML", "Scikit-Learn (Random Forest)", "Trained on parameters to predict future congestion indexes."]
    ]
    
    t = Table(arch_data, colWidths=[80, 130, 290])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e3a8a')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f8fafc')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,1), (-1,-1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("4. Machine Learning Module", h1_style))
    story.append(Paragraph(
        "<b>Algorithm:</b> Random Forest Regressor (Ensemble Regressor).<br/>"
        "<b>Model Input Parameters (Features):</b>",
        body_style
    ))
    story.append(Paragraph("1. <b>Weather:</b> Numeric representation (0: Sunny, 1: Rain, 2: Snow).", bullet_style))
    story.append(Paragraph("2. <b>Time of Day:</b> Peak multiplier mapping (0: Morning, 1: Midday, 2: Evening, 3: Night).", bullet_style))
    story.append(Paragraph("3. <b>Event Density:</b> Surrounding crowds indicator (0: None, 1: Sports, 2: Concert, 3: Holiday).", bullet_style))
    story.append(Paragraph("4. <b>Active Policies:</b> Count of dynamic signals, rerouting, and ramp meters deployed.", bullet_style))
    story.append(Paragraph("5. <b>Incidents:</b> Number of active road accidents on highways.", bullet_style))
    
    story.append(Paragraph(
        "<b>Training Pipeline:</b> The <i>server/train.py</i> script generates a synthetic historical telemetry dataset (2,500 samples) "
        "representing traffic patterns, fits the Random Forest Regressor (Max Depth=8, 100 Estimators), and validates RMSE. "
        "The model is exported to <i>server/model.pkl</i>. Average model validation accuracy root mean squared error is <b>5.68%</b>.",
        body_style
    ))
    
    story.append(PageBreak())
    
    # --- PAGE 3: DATABASE SCHEMA & ENDPOINTS ---
    story.append(Paragraph("5. Database Schema & Models", h1_style))
    story.append(Paragraph(
        "SQLite is used via SQLAlchemy ORM. The tables are declared as follows:",
        body_style
    ))
    
    story.append(Paragraph("Table: traffic_logs", h2_style))
    logs_schema = [
        ["Field Name", "Type", "Constraint", "Description"],
        ["id", "Integer", "Primary Key, Auto-increment", "Unique identifier for log point."],
        ["timestamp", "String", "Index=True", "Datetime string format (e.g. 11:08 AM)."],
        ["actual", "Integer", "None", "Global congestion index simulated (0-100%)."],
        ["predicted", "Integer", "None", "ML predicted baseline congestion index."]
    ]
    t_logs = Table(logs_schema, colWidths=[100, 70, 150, 180])
    t_logs.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#475569')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 4),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f8fafc')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,1), (-1,-1), 4),
    ]))
    story.append(t_logs)
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("Table: active_incidents", h2_style))
    inc_schema = [
        ["Field Name", "Type", "Constraint", "Description"],
        ["id", "String", "Primary Key", "Unique incident GUID (e.g. inc_178254441)."],
        ["type", "String", "None", "Incident type: accident, construction, breakdown."],
        ["roadId", "String", "None", "Highway segment identifier (e.g. nh45_north)."],
        ["roadName", "String", "None", "Highway name string (e.g. Chennai - Villupuram)."],
        ["severity", "String", "None", "Severity level: minor, moderate, severe."],
        ["description", "String", "None", "Text detailing the road blockage reason."],
        ["timestamp", "String", "None", "Spawning timestamp format."]
    ]
    t_inc = Table(inc_schema, colWidths=[70, 50, 100, 280])
    t_inc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#475569')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 4),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f8fafc')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,1), (-1,-1), 4),
    ]))
    story.append(t_inc)
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("6. API Endpoints List", h1_style))
    endpoints = [
        ["Route", "Method", "Request Body", "Response Out", "Description"],
        ["/api/history", "GET", "None", "List[TrafficLog]", "Retrieves last 15 logs for charting."],
        ["/api/logs", "POST", "TrafficLogCreate", "TrafficLog", "Writes dynamic telemetry to DB."],
        ["/api/incidents", "GET", "None", "List[Incident]", "Returns active highway crashes."],
        ["/api/incidents", "POST", "IncidentCreate", "Incident", "Saves a new incident in DB."],
        ["/api/incidents/{id}", "DELETE", "None", "204 No Content", "Deletes incident, clearing road."],
        ["/api/predict", "POST", "PredictionInput", "JSON", "Runs Random Forest ML forecasting."],
        ["/api/tomtom", "GET", "Query params", "JSON", "Queries TomTom live traffic data."]
    ]
    t_end = Table(endpoints, colWidths=[100, 50, 90, 80, 180])
    t_end.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 4),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f8fafc')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('FONTSIZE', (0,0), (-1,-1), 7.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,1), (-1,-1), 4),
    ]))
    story.append(t_end)
    
    story.append(PageBreak())
    
    # --- PAGE 4: SETUP & CLI SCRIPTS ---
    story.append(Paragraph("7. Setup & Run Instructions", h1_style))
    story.append(Paragraph("Follow these steps to run MetroFlow AI locally:", body_style))
    
    story.append(Paragraph("Step 1: Install Python dependencies", h2_style))
    story.append(Paragraph("pip install -r server/requirements.txt", code_style))
    
    story.append(Paragraph("Step 2: Train the Random Forest Regressor", h2_style))
    story.append(Paragraph("python server/train.py", code_style))
    
    story.append(Paragraph("Step 3: Run the FastAPI server", h2_style))
    story.append(Paragraph("python server/main.py", code_style))
    story.append(Paragraph("Starts FastAPI on http://127.0.0.1:8000. Docs at http://127.0.0.1:8000/docs", body_style))
    
    story.append(Paragraph("Step 4: Install npm modules & start React Frontend", h2_style))
    story.append(Paragraph("npm install\nnpm run dev", code_style))
    story.append(Paragraph("Launches development dashboard at http://localhost:5173", body_style))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("8. Database Utilities CLI Scripts", h1_style))
    story.append(Paragraph(
        "Manage the database using direct npm command-line triggers:",
        body_style
    ))
    story.append(Paragraph("• <b>Seed Logs:</b> <i>npm run db:seed</i> (Fills SQLite with 100 historical logs simulating peak curves)", bullet_style))
    story.append(Paragraph("• <b>Export Data:</b> <i>npm run db:export</i> (Exports all database log records to a CSV file)", bullet_style))
    story.append(Paragraph("• <b>Clear Database:</b> <i>npm run db:clear</i> (Resets database by deleting logs and active incidents)", bullet_style))
    
    # Build Document
    doc.build(story)
    print(f"[OK] PDF Report successfully compiled and saved to {filename}")

if __name__ == "__main__":
    build_pdf()
