import { Router } from 'express';
import { Task } from '../db/index.js';
const router = Router();

// the dashboard
router.get('/dashboard', async (req, res) => {
  const uid = req.session.user.id;
  const [total, completed, pending] = await Promise.all([
    Task.count({ where: { userId: uid } }),
    Task.count({ where: { userId: uid, status: 'completed' } }),
    Task.count({ where: { userId: uid, status: 'pending' } })
  ]);
  res.render('dashboard', { title: 'Dashboard', stats: { total, completed, pending } });
});

// to list all the tasks
router.get('/tasks', async (req, res) => {
  const tasks = await Task.findAll({
    where: { userId: req.session.user.id },
    order: [['dueDate', 'ASC'], ['id', 'DESC']]
  });
  res.render('tasks/list', { title: 'My Tasks', tasks: tasks.map(t => t.toJSON()) });
});
// form to add a taks
router.get('/tasks/add', (_req, res) => res.render('tasks/add', { title: 'Add Task' }));

// to create a task
router.post('/tasks/add', async (req, res) => {
  const { title = '', description = '', dueDate = '', status = 'pending' } = req.body;
  const errors = [];
  if (!title.trim()) errors.push('Title is required.');
  if (status !== 'pending' && status !== 'completed') errors.push('Invalid status.');

  if (errors.length) return res.status(400).render('tasks/add', { title: 'Add Task', errors, body: req.body });

  try {
    await Task.create({
      title: title.trim(),
      description: description?.trim() || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      status,
      userId: req.session.user.id
    });
    res.redirect('/tasks');
  } catch (e) {
    res.status(500).render('tasks/add', { title: 'Add Task', errors: ['Could not create task.'], body: req.body });
  }
});

// form to edit the task
router.get('/tasks/edit/:id', async (req, res) => {
  const task = await Task.findOne({ where: { id: req.params.id, userId: req.session.user.id } });
  if (!task) return res.redirect('/tasks');
  res.render('tasks/edit', { title: 'Edit Task', task: task.toJSON() });
});
// to update it
router.post('/tasks/edit/:id', async (req, res) => {
  const { title = '', description = '', dueDate = '', status = 'pending' } = req.body;
  const uid = req.session.user.id;
  try {
    const task = await Task.findOne({ where: { id: req.params.id, userId: uid } });
    if (!task) return res.redirect('/tasks');

    task.title = title.trim();
    task.description = description?.trim() || null;
    task.dueDate = dueDate ? new Date(dueDate) : null;
    task.status = status;
    await task.save();

    res.redirect('/tasks');
  } catch (e) {
    res.status(500).render('tasks/edit', { title: 'Edit Task', errors: ['Could not update task.'], task: { id: req.params.id, ...req.body } });
  }
});

// to delete the task
router.post('/tasks/delete/:id', async (req, res) => {
  await Task.destroy({ where: { id: req.params.id, userId: req.session.user.id } });
  res.redirect('/tasks');
});
// for the toggle
router.post('/tasks/status/:id', async (req, res) => {
  const t = await Task.findOne({ where: { id: req.params.id, userId: req.session.user.id } });
  if (t) {
    t.status = t.status === 'completed' ? 'pending' : 'completed';
    await t.save();
  }
  res.redirect('/tasks');
});
export default router;