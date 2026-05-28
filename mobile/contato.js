import { initChrome } from './chrome.js';
import { initReveals } from './reveal.js';
import { initAccordion } from './accordion.js';

const LABELS = {
  'tipo-servico': 'serviço', nome: 'nome', sobrenome: 'sobrenome',
  email: 'email', telefone: 'telefone', mensagem: 'mensagem',
};

function start() {
  initChrome();
  enhanceForm();
  const faq = document.querySelector('.s-accordion');
  if (faq) initAccordion(faq, { item: '.faq-item', trigger: '.faq-question', panel: '.faq-answer' });
  initReveals('.reveal');
}

function enhanceForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  // Wrap each control in a labelled field with an error slot.
  form.querySelectorAll('input,select,textarea').forEach((ctrl) => {
    const name = ctrl.name;
    const field = document.createElement('div');
    field.className = 'm-field';
    const label = document.createElement('label');
    label.textContent = LABELS[name] || name;
    const id = `f-${name}`; ctrl.id = id; label.setAttribute('for', id);
    const err = document.createElement('div'); err.className = 'm-error'; err.id = `${id}-err`;
    ctrl.setAttribute('aria-describedby', err.id);
    ctrl.parentNode.replaceChild(field, ctrl);
    field.append(label, ctrl, err);
  });

  form.setAttribute('novalidate', '');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    const success = document.createElement('div');
    success.className = 'm-form-success';
    success.setAttribute('role', 'status');
    success.setAttribute('tabindex', '-1');
    success.textContent = 'mensagem enviada — em breve a equipe da lusso entra em contato';
    form.replaceWith(success);
    success.focus();
  });
}

function validate(form) {
  let ok = true;
  form.querySelectorAll('input,select,textarea').forEach((ctrl) => {
    const field = ctrl.closest('.m-field');
    const err = field.querySelector('.m-error');
    let msg = '';
    if (ctrl.required && !ctrl.value.trim()) msg = 'campo obrigatório';
    else if (ctrl.type === 'email' && ctrl.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ctrl.value)) msg = 'email inválido';
    field.classList.toggle('m-invalid', !!msg);
    err.textContent = msg;
    if (msg) ok = false;
  });
  return ok;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
