"use client";
import React from 'react';

function fill(email: string, password = '1') {
  const form = document.querySelector<HTMLFormElement>('form[action="/api/auth/login"]');
  if (!form) return;
  const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]');
  const passInput = form.querySelector<HTMLInputElement>('input[name="password"]');
  if (emailInput) emailInput.value = email;
  if (passInput) passInput.value = password;
  emailInput?.focus();
}

export default function DemoAutofill() {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
      <button type="button" className="btn-outline" onClick={() => fill('admin@local')}>
        Autofill Admin
      </button>
      <button type="button" className="btn-outline" onClick={() => fill('shop1@local')}>
        Autofill Shop
      </button>
      <button type="button" className="btn-outline" onClick={() => fill('user@local')}>
        Autofill User
      </button>
    </div>
  );
}

