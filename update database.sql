-- 1. جدول المستخدمين وحسابات تسجيل الدخول (Users Table)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
    password_hash VARCHAR(255) NOT NULL, -- لتخزين كلمات المرور مشفرة بأمان
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. جدول بيانات الشركات (Company Profiles)
-- مرتبط بجدول المستخدمين (علاقة رأس برأس أو رأس لأطراف: مستخدم يملك شركة)
CREATE TABLE companies (
    company_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    industry_sector VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. جدول طلبات الخدمات والحملات (Service Requests / Briefs)
-- هذا الجدول يربط حقول صفحة الـ Contact والـ Dashboard مع الإدارة والمدير
CREATE TABLE service_requests (
    request_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL, -- يظل الطلب محفوظاً حتى لو حُذف الحساب
    campaign_objective VARCHAR(150) NOT NULL,
    project_summary TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. جدول شات التواصل الفوري بين المدير والعميل (Live Chat Log Table)
CREATE TABLE communication_chats (
    chat_id SERIAL PRIMARY KEY,
    request_id INT REFERENCES service_requests(request_id) ON DELETE CASCADE,
    sender_type VARCHAR(10) CHECK (sender_type IN ('Admin', 'Client')),
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء كشافات (Indexes) سريعة لتسريع عمليات تسجيل الدخول والبحث عن الطلبات
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_requests_status ON service_requests(status);

-- 1. إنشاء جدول المشاريع الرئيسي (المظلة لكل شيء)
CREATE TABLE tv_projects (
    project_id VARCHAR(50) PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    project_type VARCHAR(100), -- (Drama, Talk Show, Documentary, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. إنشاء جدول بدء المشاريع وقائمة المراجعة (Project Start Checklist)
CREATE TABLE project_start_checklist (
    task_id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) REFERENCES tv_projects(project_id) ON DELETE CASCADE,
    phase VARCHAR(100) NOT NULL, -- (Initiation, Planning, Execution)
    task_name VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(150),
    deadline DATE,
    priority VARCHAR(50), -- (Critical, High, Medium, Low)
    status VARCHAR(50) DEFAULT 'Not Started', -- (Not Started, In Progress, Completed)
    notes TEXT
);

-- 3. إنشاء جدول قاعدة بيانات الإنتاج وتفاصيل الحلقات والمشاهد (TV Production Database)
CREATE TABLE tv_production_scenes (
    scene_id SERIAL PRIMARY KEY,
    project_id VARCHAR(50) REFERENCES tv_projects(project_id) ON DELETE CASCADE,
    episode_number INT NOT NULL,
    scene_number VARCHAR(50) NOT NULL,
    production_phase VARCHAR(100), -- (Pre-production, Filming, Post-production)
    location_name VARCHAR(255),
    shooting_date DATE,
    cast_required TEXT,
    crew_in_charge TEXT,
    budget_allocated_egp NUMERIC(12, 2),
    status VARCHAR(50) DEFAULT 'Scheduled' -- (Scheduled, In Progress, Completed, Pending)
);


-- ========================================================
-- إدخال بيانات تجريبية (Insert Sample Data) للتأكد من الشغل
-- ========================================================

-- إضافة مشاريع في الجدول الرئيسي
INSERT INTO tv_projects (project_id, project_name, project_type) VALUES 
('PROJ-001', 'Ramadan Drama 2027', 'Drama Series'),
('PROJ-002', 'Talk Show Season 5', 'Entertainment');

-- إضافة خطوات بدء المشروع (Checklist)
INSERT INTO project_start_checklist (task_id, project_id, phase, task_name, assigned_to, deadline, priority, status, notes) VALUES
('START-01', 'PROJ-001', 'Initiation', 'Define Project Scope & Concept', 'Producer', '2027-01-15', 'High', 'Completed', 'Concept approved by board'),
('START-02', 'PROJ-001', 'Planning', 'Approve Initial Budget & Funding', 'Executive Producer', '2027-01-25', 'Critical', 'In Progress', 'Awaiting final sign-off'),
('START-03', 'PROJ-002', 'Planning', 'Finalize Script & Storyboards', 'Director', '2027-02-10', 'High', 'Not Started', 'Draft 2 is ready');

-- إضافة تفاصيل الإنتاج والتصوير
INSERT INTO tv_production_scenes (project_id, episode_number, scene_number, production_phase, location_name, shooting_date, cast_required, crew_in_charge, budget_allocated_egp, status) VALUES
('PROJ-001', 1, 'Scene 12', 'Filming', 'Studio 5 - Cairo', '2027-04-10', 'Actor A, Actor B', 'Director, DOP', 150000.00, 'Scheduled'),
('PROJ-001', 1, 'Scene 05', 'Pre-production', 'Outdoor - Alex', '2027-04-12', 'Actor C', 'Location Manager', 75000.00, 'Pending Approval'),
('PROJ-002', 12, 'Segment A', 'Post-production', 'Main Studio', '2027-04-15', 'Host, Guest X', 'Editor, Sound Eng', 50000.00, 'In Progress');


-- ========================================================
-- كود استعلام (Query) لعرض كل بيانات الإنتاج مع اسم المشروع
-- ========================================================
SELECT 
    p.project_name,
    p.project_type,
    s.episode_number,
    s.scene_number,
    s.production_phase,
    s.location_name,
    s.shooting_date,
    s.budget_allocated_egp,
    s.status
FROM tv_production_scenes s
JOIN tv_projects p ON s.project_id = p.project_id;

