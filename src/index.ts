import { DurableObject } from "cloudflare:workers";
import { Hono } from "hono";

// Helper for crypto password hashing using SHA-256
async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password + "taskflow_salt_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateId(): string {
  return "tf_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function generateToken(): string {
  return "tok_" + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

export class App extends DurableObject {
  private app: Hono;

  constructor(ctx: DurableObjectState, env: Record<string, unknown>) {
    super(ctx, env);
    this.app = new Hono();
    this.initDatabase();
    this.setupRoutes();
  }

  private initDatabase() {
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        name TEXT NOT NULL,
        avatar_url TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT,
        is_default INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        start_time TEXT,
        end_time TEXT,
        duration INTEGER DEFAULT 30,
        priority TEXT NOT NULL DEFAULT 'medium',
        category_id TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        recurring_rule TEXT NOT NULL DEFAULT 'none',
        recurring_parent_id TEXT,
        created_at TEXT NOT NULL,
        completed_at TEXT
      );

      CREATE TABLE IF NOT EXISTS subtasks (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        user_id TEXT PRIMARY KEY,
        theme TEXT DEFAULT 'system',
        supabase_url TEXT,
        supabase_anon_key TEXT,
        week_start_on_monday INTEGER DEFAULT 1,
        working_hours_start TEXT DEFAULT '08:00',
        working_hours_end TEXT DEFAULT '18:00'
      );
    `);
  }

  private async getAuthUser(c: any): Promise<any | null> {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return null;

    const sessionRes = this.ctx.storage.sql
      .exec(`SELECT user_id, expires_at FROM sessions WHERE token = ?`, token)
      .toArray();

    if (sessionRes.length === 0) return null;
    const session = sessionRes[0] as { user_id: string; expires_at: number };

    if (Date.now() > session.expires_at) {
      this.ctx.storage.sql.exec(`DELETE FROM sessions WHERE token = ?`, token);
      return null;
    }

    const userRes = this.ctx.storage.sql
      .exec(`SELECT id, email, name, avatar_url, created_at FROM users WHERE id = ?`, session.user_id)
      .toArray();

    if (userRes.length === 0) return null;
    return userRes[0];
  }

  private seedDefaultCategories(userId: string) {
    const existing = this.ctx.storage.sql
      .exec(`SELECT COUNT(*) as cnt FROM categories WHERE user_id = ?`, userId)
      .one();

    if ((existing.cnt as number) === 0) {
      const defaults = [
        { name: "Work", color: "#6366f1", icon: "briefcase" },
        { name: "Personal", color: "#10b981", icon: "user" },
        { name: "Health & Fitness", color: "#f43f5e", icon: "heart" },
        { name: "Finance", color: "#f59e0b", icon: "dollar-sign" },
        { name: "Learning", color: "#8b5cf6", icon: "book-open" }
      ];
      for (const d of defaults) {
        this.ctx.storage.sql.exec(
          `INSERT INTO categories (id, user_id, name, color, icon, is_default) VALUES (?, ?, ?, ?, ?, 1)`,
          generateId(),
          userId,
          d.name,
          d.color,
          d.icon
        );
      }
    }
  }

  private seedSampleTasksForUser(userId: string) {
    const existing = this.ctx.storage.sql
      .exec(`SELECT COUNT(*) as cnt FROM tasks WHERE user_id = ?`, userId)
      .one();

    if ((existing.cnt as number) > 0) return;

    // Get category IDs
    const cats = this.ctx.storage.sql
      .exec(`SELECT id, name FROM categories WHERE user_id = ?`, userId)
      .toArray() as { id: string; name: string }[];

    const getCat = (name: string) => cats.find((c) => c.name.toLowerCase().includes(name.toLowerCase()))?.id || cats[0]?.id || "";

    const todayStr = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const sampleTasks = [
      {
        title: "Morning Routine & Planning",
        description: "Review daily goals, meditate for 10 minutes, set top 3 priorities.",
        date: todayStr,
        start_time: "08:00",
        end_time: "08:30",
        duration: 30,
        priority: "medium",
        category_id: getCat("Personal"),
        status: "completed",
        recurring_rule: "daily",
        subtasks: ["10 min meditation", "Review calendar", "Write top 3 goals"]
      },
      {
        title: "Q3 Strategy & Product Roadmap Review",
        description: "Draft milestone goals, update sprint board, align with team leads.",
        date: todayStr,
        start_time: "09:30",
        end_time: "11:00",
        duration: 90,
        priority: "high",
        category_id: getCat("Work"),
        status: "in_progress",
        recurring_rule: "none",
        subtasks: ["Draft quarterly objectives", "Review user feedback", "Update timeline matrix"]
      },
      {
        title: "Gym Workout - Upper Body & Cardio",
        description: "Bench press, pull-ups, overhead press + 20 min interval running.",
        date: todayStr,
        start_time: "12:15",
        end_time: "13:30",
        duration: 75,
        priority: "high",
        category_id: getCat("Health"),
        status: "pending",
        recurring_rule: "weekdays",
        subtasks: ["Hydrate", "Stretching", "Weight training", "20m HIIT treadmill"]
      },
      {
        title: "Client Sync & Demo Presentation",
        description: "Walk through interactive planner features, collect feedback.",
        date: todayStr,
        start_time: "14:30",
        end_time: "15:30",
        duration: 60,
        priority: "urgent",
        category_id: getCat("Work"),
        status: "pending",
        recurring_rule: "none",
        subtasks: ["Prepare slide deck", "Test preview build", "Send calendar invites"]
      },
      {
        title: "Read Chapter 4 of Deep Work",
        description: "Take notes on focus techniques and ritual building.",
        date: todayStr,
        start_time: "17:00",
        end_time: "18:00",
        duration: 60,
        priority: "low",
        category_id: getCat("Learning"),
        status: "pending",
        recurring_rule: "none",
        subtasks: ["Highlight key quotes", "Summarize key takeaway in Notion"]
      },
      {
        title: "Weekly Budget & Expense Review",
        description: "Categorize transaction statements and adjust savings allocations.",
        date: tomorrowStr,
        start_time: "10:00",
        end_time: "10:45",
        duration: 45,
        priority: "medium",
        category_id: getCat("Finance"),
        status: "pending",
        recurring_rule: "weekly",
        subtasks: ["Export bank CSV", "Log investments", "Check monthly cap"]
      },
      {
        title: "Team Standup & Sync",
        description: "Daily 15-minute quick sync.",
        date: yesterdayStr,
        start_time: "09:00",
        end_time: "09:15",
        duration: 15,
        priority: "medium",
        category_id: getCat("Work"),
        status: "completed",
        recurring_rule: "daily",
        subtasks: ["Blockers update", "Deploy review"]
      }
    ];

    for (const t of sampleTasks) {
      const taskId = generateId();
      this.ctx.storage.sql.exec(
        `INSERT INTO tasks (id, user_id, title, description, date, start_time, end_time, duration, priority, category_id, status, recurring_rule, created_at, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        taskId,
        userId,
        t.title,
        t.description,
        t.date,
        t.start_time,
        t.end_time,
        t.duration,
        t.priority,
        t.category_id,
        t.status,
        t.recurring_rule,
        new Date().toISOString(),
        t.status === "completed" ? new Date().toISOString() : null
      );

      for (const st of t.subtasks) {
        this.ctx.storage.sql.exec(
          `INSERT INTO subtasks (id, task_id, title, completed) VALUES (?, ?, ?, ?)`,
          generateId(),
          taskId,
          st,
          t.status === "completed" ? 1 : 0
        );
      }
    }
  }

  private setupRoutes() {
    const api = new Hono();

    // Health check
    api.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

    // Demo Login shortcut
    api.post("/auth/demo", async (c) => {
      const email = "demo@taskflow.app";
      let userRes = this.ctx.storage.sql.exec(`SELECT * FROM users WHERE email = ?`, email).toArray();

      let userId = "";
      if (userRes.length === 0) {
        userId = generateId();
        const pwdHash = await hashPassword("demo123");
        this.ctx.storage.sql.exec(
          `INSERT INTO users (id, email, password_hash, name, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
          userId,
          email,
          pwdHash,
          "Alex Morgan",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          new Date().toISOString()
        );
      } else {
        userId = (userRes[0] as any).id;
      }

      this.seedDefaultCategories(userId);
      this.seedSampleTasksForUser(userId);

      const token = generateToken();
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
      this.ctx.storage.sql.exec(
        `INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`,
        token,
        userId,
        expiresAt
      );

      const user = this.ctx.storage.sql
        .exec(`SELECT id, email, name, avatar_url, created_at FROM users WHERE id = ?`, userId)
        .one();

      return c.json({ token, user });
    });

    // Auth Signup
    api.post("/auth/signup", async (c) => {
      const body = await c.req.json<{ email?: string; password?: string; name?: string }>();
      const email = body.email?.trim().toLowerCase();
      const password = body.password;
      const name = body.name?.trim() || "Planner User";

      if (!email || !password) {
        return c.json({ error: "Email and password are required." }, 400);
      }

      const existing = this.ctx.storage.sql.exec(`SELECT id FROM users WHERE email = ?`, email).toArray();
      if (existing.length > 0) {
        return c.json({ error: "An account with this email already exists." }, 400);
      }

      const userId = generateId();
      const passwordHash = await hashPassword(password);
      const createdAt = new Date().toISOString();

      this.ctx.storage.sql.exec(
        `INSERT INTO users (id, email, password_hash, name, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        userId,
        email,
        passwordHash,
        name,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        createdAt
      );

      this.seedDefaultCategories(userId);
      this.seedSampleTasksForUser(userId);

      const token = generateToken();
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
      this.ctx.storage.sql.exec(
        `INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`,
        token,
        userId,
        expiresAt
      );

      return c.json({
        token,
        user: { id: userId, email, name, avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`, created_at: createdAt }
      });
    });

    // Auth Login
    api.post("/auth/login", async (c) => {
      const body = await c.req.json<{ email?: string; password?: string }>();
      const email = body.email?.trim().toLowerCase();
      const password = body.password;

      if (!email || !password) {
        return c.json({ error: "Email and password are required." }, 400);
      }

      const userRes = this.ctx.storage.sql.exec(`SELECT * FROM users WHERE email = ?`, email).toArray();
      if (userRes.length === 0) {
        return c.json({ error: "Invalid email or password." }, 401);
      }

      const user = userRes[0] as any;
      const hash = await hashPassword(password);
      if (user.password_hash !== hash) {
        return c.json({ error: "Invalid email or password." }, 401);
      }

      this.seedDefaultCategories(user.id);

      const token = generateToken();
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
      this.ctx.storage.sql.exec(
        `INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`,
        token,
        user.id,
        expiresAt
      );

      return c.json({
        token,
        user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url, created_at: user.created_at }
      });
    });

    // Get current user profile
    api.get("/auth/me", async (c) => {
      const user = await this.getAuthUser(c);
      if (!user) return c.json({ error: "Unauthorized" }, 401);
      return c.json({ user });
    });

    // Logout
    api.post("/auth/logout", async (c) => {
      const authHeader = c.req.header("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "").trim();
        this.ctx.storage.sql.exec(`DELETE FROM sessions WHERE token = ?`, token);
      }
      return c.json({ success: true });
    });

    // Categories routes
    api.get("/categories", async (c) => {
      const user = await this.getAuthUser(c);
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      this.seedDefaultCategories(user.id);
      const categories = this.ctx.storage.sql
        .exec(`SELECT * FROM categories WHERE user_id = ? ORDER BY is_default DESC, name ASC`, user.id)
        .toArray();

      return c.json({ categories });
    });

    api.post("/categories", async (c) => {
      const user = await this.getAuthUser(c);
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { name, color, icon } = await c.req.json<{ name: string; color: string; icon?: string }>();
      if (!name || !color) {
        return c.json({ error: "Name and color are required" }, 400);
      }

      const id = generateId();
      this.ctx.storage.sql.exec(
        `INSERT INTO categories (id, user_id, name, color, icon, is_default) VALUES (?, ?, ?, ?, ?, 0)`,
        id,
        user.id,
        name.trim(),
        color,
        icon || "folder"
      );

      return c.json({ category: { id, user_id: user.id, name: name.trim(), color, icon: icon || "folder", is_default: 0 } });
    });

    api.delete("/categories/:id", async (c) => {
      const user = await this.getAuthUser(c);
      if (!user) return c.json({ error: "Unauthorized" }, 401);
      const catId = c.req.param("id");

      this.ctx.storage.sql.exec(`DELETE FROM categories WHERE id = ? AND user_id = ?`, catId, user.id);
      return c.json({ success: true });
    });

    // Tasks routes
    api.get("/tasks", async (c) => {
      const user = await this.getAuthUser(c);
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const url = new URL(c.req.url);
      const date = url.searchParams.get("date");
      const month = url.searchParams.get("month"); // YYYY-MM
      const categoryId = url.searchParams.get("category_id");
      const priority = url.searchParams.get("priority");
      const status = url.searchParams.get("status");
      const search = url.searchParams.get("search");

      let query = `SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
                   FROM tasks t
                   LEFT JOIN categories c ON t.category_id = c.id
                   WHERE t.user_id = ?`;
      const params: any[] = [user.id];

      if (date) {
        query += ` AND t.date = ?`;
        params.push(date);
      } else if (month) {
        query += ` AND t.date LIKE ?`;
        params.push(`${month}-%`);
      }

      if (categoryId) {
        query += ` AND t.category_id = ?`;
        params.push(categoryId);
      }

      if (priority) {
        query += ` AND t.priority = ?`;
        params.push(priority);
      }

      if (status) {
        query += ` AND t.status = ?`;
        params.push(status);
      }

      if (search) {
        query += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ` ORDER BY t.date ASC, t.start_time ASC, t.priority DESC`;

      const rows = this.ctx.storage.sql.exec(query, ...params).toArray();

      // Fetch subtasks for these tasks
      const tasksWithSubtasks = rows.map((task: any) => {
        const subtasks = this.ctx.storage.sql
          .exec(`SELECT id, title, completed FROM subtasks WHERE task_id = ?`, task.id)
          .toArray();
        return { ...task, subtasks };
      });

      return c.json({ tasks: tasksWithSubtasks });
    });

    api.post("/tasks", async (c) => {
      const user = await this.getAuthUser(c);
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const body = await c.req.json<{
        title: string;
        description?: string;
        date: string;
        start_time?: string;
        end_time?: string;
        duration?: number;
        priority?: string;
        category_id?: string;
        status?: string;
        recurring_rule?: string;
        subtasks?: { title: string; completed?: boolean }[];
      }>();

      if (!body.title || !body.date) {
        return c.json({ error: "Title and date are required" }, 400);
      }

      const id = generateId();
      const createdAt = new Date().toISOString();
      const status = body.status || "pending";
      const priority = body.priority || "medium";
      const recurring_rule = body.recurring_rule || "none";

      this.ctx.storage.sql.exec(
        `INSERT INTO tasks (id, user_id, title, description, date, start_time, end_time, duration, priority, category_id, status, recurring_rule, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        user.id,
        body.title.trim(),
        body.description || "",
        body.date,
        body.start_time || null,
        body.end_time || null,
        body.duration || 30,
        priority,
        body.category_id || null,
        status,
        recurring_rule,
        createdAt
      );

      const insertedSubtasks: any[] = [];
      if (body.subtasks && Array.isArray(body.subtasks)) {
        for (const st of body.subtasks) {
          const stId = generateId();
          const isComp = st.completed ? 1 : 0;
          this.ctx.storage.sql.exec(
            `INSERT INTO subtasks (id, task_id, title, completed) VALUES (?, ?, ?, ?)`,
            stId,
            id,
            st.title,
            isComp
          );
          insertedSubtasks.push({ id: stId, title: st.title, completed: isComp });
        }
      }

      // Fetch category info if applicable
      let category = null;
      if (body.category_id) {
        const catRes = this.ctx.storage.sql
          .exec(`SELECT name, color, icon FROM categories WHERE id = ?`, body.category_id)
          .toArray();
        if (catRes.length > 0) {
          category = catRes[0];
        }
      }

      return c.json({
        task: {
          id,
          user_id: user.id,
          title: body.title.trim(),
          description: body.description || "",
          date: body.date,
          start_time: body.start_time || null,
          end_time: body.end_time || null,
          duration: body.duration || 30,
          priority,
          category_id: body.category_id || null,
          category_name: (category as any)?.name || null,
          category_color: (category as any)?.color || null,
          category_icon: (category as any)?.icon || null,
          status,
          recurring_rule,
          created_at: createdAt,
          subtasks: insertedSubtasks
        }
      });
    });

    api.put("/tasks/:id", async (c) => {
      const user = await this.getAuthUser(c);
      if (!user) return c.json({ error: "Unauthorized" }, 401);
      const taskId = c.req.param("id");

      const existing = this.ctx.storage.sql
        .exec(`SELECT * FROM tasks WHERE id = ? AND user_id = ?`, taskId, user.id)
        .toArray();
      if (existing.length === 0) {
        return c.json({ error: "Task not found" }, 404);
      }

      const body = await c.req.json<{
        title?: string;
        description?: string;
        date?: string;
        start_time?: string;
        end_time?: string;
        duration?: number;
        priority?: string;
        category_id?: string;
        status?: string;
        recurring_rule?: string;
        subtasks?: { id?: string; title: string; completed?: boolean }[];
      }>();

      const current = existing[0] as any;
      const title = body.title !== undefined ? body.title.trim() : current.title;
      const description = body.description !== undefined ? body.description : current.description;
      const date = body.date !== undefined ? body.date : current.date;
      const start_time = body.start_time !== undefined ? body.start_time : current.start_time;
      const end_time = body.end_time !== undefined ? body.end_time : current.end_time;
      const duration = body.duration !== undefined ? body.duration : current.duration;
      const priority = body.priority !== undefined ? body.priority : current.priority;
      const category_id = body.category_id !== undefined ? body.category_id : current.category_id;
      const status = body.status !== undefined ? body.status : current.status;
      const recurring_rule = body.recurring_rule !== undefined ? body.recurring_rule : current.recurring_rule;
      const completed_at = status === "completed" && current.status !== "completed" ? new Date().toISOString() : current.completed_at;

      this.ctx.storage.sql.exec(
        `UPDATE tasks
         SET title = ?, description = ?, date = ?, start_time = ?, end_time = ?, duration = ?, priority = ?, category_id = ?, status = ?, recurring_rule = ?, completed_at = ?
         WHERE id = ? AND user_id = ?`,
        title,
        description,
        date,
        start_time,
        end_time,
        duration,
        priority,
        category_id,
        status,
        recurring_rule,
        completed_at,
        taskId,
        user.id
      );

      // Handle subtasks update if provided
      if (body.subtasks && Array.isArray(body.subtasks)) {
        this.ctx.storage.sql.exec(`DELETE FROM subtasks WHERE task_id = ?`, taskId);
        for (const st of body.subtasks) {
          const stId = st.id || generateId();
          this.ctx.storage.sql.exec(
            `INSERT INTO subtasks (id, task_id, title, completed) VALUES (?, ?, ?, ?)`,
            stId,
            taskId,
            st.title,
            st.completed ? 1 : 0
          );
        }
      }

      // Automatically spawn next occurrence if recurring task was marked completed!
      if (status === "completed" && current.status !== "completed" && recurring_rule !== "none") {
        this.spawnNextRecurringInstance(current, recurring_rule, user.id);
      }

      return c.json({ success: true });
    });

    api.delete("/tasks/:id", async (c) => {
      const user = await this.getAuthUser(c);
      if (!user) return c.json({ error: "Unauthorized" }, 401);
      const taskId = c.req.param("id");

      this.ctx.storage.sql.exec(`DELETE FROM subtasks WHERE task_id = ?`, taskId);
      this.ctx.storage.sql.exec(`DELETE FROM tasks WHERE id = ? AND user_id = ?`, taskId, user.id);
      return c.json({ success: true });
    });

    // Batch completion or deletion
    api.post("/tasks/batch", async (c) => {
      const user = await this.getAuthUser(c);
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { action, task_ids, status, category_id } = await c.req.json<{
        action: "complete" | "delete" | "update_category" | "update_status";
        task_ids: string[];
        status?: string;
        category_id?: string;
      }>();

      if (!task_ids || !Array.isArray(task_ids) || task_ids.length === 0) {
        return c.json({ error: "No task IDs provided" }, 400);
      }

      if (action === "delete") {
        for (const id of task_ids) {
          this.ctx.storage.sql.exec(`DELETE FROM subtasks WHERE task_id = ?`, id);
          this.ctx.storage.sql.exec(`DELETE FROM tasks WHERE id = ? AND user_id = ?`, id, user.id);
        }
      } else if (action === "complete" || action === "update_status") {
        const targetStatus = action === "complete" ? "completed" : status || "completed";
        for (const id of task_ids) {
          const t = this.ctx.storage.sql.exec(`SELECT * FROM tasks WHERE id = ? AND user_id = ?`, id, user.id).toArray()[0] as any;
          if (t) {
            this.ctx.storage.sql.exec(
              `UPDATE tasks SET status = ?, completed_at = ? WHERE id = ? AND user_id = ?`,
              targetStatus,
              targetStatus === "completed" ? new Date().toISOString() : null,
              id,
              user.id
            );
            if (targetStatus === "completed" && t.status !== "completed" && t.recurring_rule !== "none") {
              this.spawnNextRecurringInstance(t, t.recurring_rule, user.id);
            }
          }
        }
      } else if (action === "update_category") {
        for (const id of task_ids) {
          this.ctx.storage.sql.exec(
            `UPDATE tasks SET category_id = ? WHERE id = ? AND user_id = ?`,
            category_id || null,
            id,
            user.id
          );
        }
      }

      return c.json({ success: true });
    });

    // User Settings
    api.get("/settings", async (c) => {
      const user = await this.getAuthUser(c);
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      let settings = this.ctx.storage.sql
        .exec(`SELECT * FROM user_settings WHERE user_id = ?`, user.id)
        .toArray();

      if (settings.length === 0) {
        this.ctx.storage.sql.exec(
          `INSERT INTO user_settings (user_id, theme, week_start_on_monday, working_hours_start, working_hours_end)
           VALUES (?, 'system', 1, '08:00', '18:00')`,
          user.id
        );
        settings = this.ctx.storage.sql
          .exec(`SELECT * FROM user_settings WHERE user_id = ?`, user.id)
          .toArray();
      }

      return c.json({ settings: settings[0] });
    });

    api.put("/settings", async (c) => {
      const user = await this.getAuthUser(c);
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const body = await c.req.json<{
        theme?: string;
        supabase_url?: string;
        supabase_anon_key?: string;
        week_start_on_monday?: boolean;
        working_hours_start?: string;
        working_hours_end?: string;
      }>();

      const existing = this.ctx.storage.sql
        .exec(`SELECT * FROM user_settings WHERE user_id = ?`, user.id)
        .toArray();

      if (existing.length === 0) {
        this.ctx.storage.sql.exec(
          `INSERT INTO user_settings (user_id, theme, supabase_url, supabase_anon_key, week_start_on_monday, working_hours_start, working_hours_end)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          user.id,
          body.theme || "system",
          body.supabase_url || null,
          body.supabase_anon_key || null,
          body.week_start_on_monday ? 1 : 0,
          body.working_hours_start || "08:00",
          body.working_hours_end || "18:00"
        );
      } else {
        const cur = existing[0] as any;
        this.ctx.storage.sql.exec(
          `UPDATE user_settings
           SET theme = ?, supabase_url = ?, supabase_anon_key = ?, week_start_on_monday = ?, working_hours_start = ?, working_hours_end = ?
           WHERE user_id = ?`,
          body.theme !== undefined ? body.theme : cur.theme,
          body.supabase_url !== undefined ? body.supabase_url : cur.supabase_url,
          body.supabase_anon_key !== undefined ? body.supabase_anon_key : cur.supabase_anon_key,
          body.week_start_on_monday !== undefined ? (body.week_start_on_monday ? 1 : 0) : cur.week_start_on_monday,
          body.working_hours_start !== undefined ? body.working_hours_start : cur.working_hours_start,
          body.working_hours_end !== undefined ? body.working_hours_end : cur.working_hours_end,
          user.id
        );
      }

      return c.json({ success: true });
    });

    this.app.route("/api", api);
  }

  private spawnNextRecurringInstance(parentTask: any, rule: string, userId: string) {
    const curDate = new Date(parentTask.date);
    let nextDate = new Date(curDate);

    if (rule === "daily") {
      nextDate.setDate(curDate.getDate() + 1);
    } else if (rule === "weekdays") {
      do {
        nextDate.setDate(nextDate.getDate() + 1);
      } while (nextDate.getDay() === 0 || nextDate.getDay() === 6); // 0=Sun, 6=Sat
    } else if (rule === "weekly") {
      nextDate.setDate(curDate.getDate() + 7);
    } else if (rule === "monthly") {
      nextDate.setMonth(curDate.getMonth() + 1);
    } else {
      return;
    }

    const nextDateStr = nextDate.toISOString().split("T")[0];

    // Check if task already exists on nextDate to avoid duplicate spawns
    const check = this.ctx.storage.sql
      .exec(`SELECT id FROM tasks WHERE user_id = ? AND recurring_parent_id = ? AND date = ?`, userId, parentTask.id, nextDateStr)
      .toArray();

    if (check.length === 0) {
      const newTaskId = generateId();
      this.ctx.storage.sql.exec(
        `INSERT INTO tasks (id, user_id, title, description, date, start_time, end_time, duration, priority, category_id, status, recurring_rule, recurring_parent_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
        newTaskId,
        userId,
        parentTask.title,
        parentTask.description,
        nextDateStr,
        parentTask.start_time,
        parentTask.end_time,
        parentTask.duration,
        parentTask.priority,
        parentTask.category_id,
        rule,
        parentTask.id,
        new Date().toISOString()
      );

      // Copy subtasks as uncompleted
      const subtasks = this.ctx.storage.sql
        .exec(`SELECT title FROM subtasks WHERE task_id = ?`, parentTask.id)
        .toArray();

      for (const st of subtasks) {
        this.ctx.storage.sql.exec(
          `INSERT INTO subtasks (id, task_id, title, completed) VALUES (?, ?, ?, 0)`,
          generateId(),
          newTaskId,
          (st as any).title
        );
      }
    }
  }

  async fetch(request: Request): Promise<Response> {
    return this.app.fetch(request);
  }
}
