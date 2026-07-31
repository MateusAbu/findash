import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionForm from './TransactionForm';

function renderForm(onSubmit = vi.fn()) {
  render(<TransactionForm editing={null} onSubmit={onSubmit} onCancelEdit={() => {}} />);
  return onSubmit;
}

describe('TransactionForm — validação (RF-T2)', () => {
  it('bloqueia submit vazio com erros por campo (descrição e valor)', async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(screen.getByText('Descrição é obrigatória.')).toBeInTheDocument();
    expect(screen.getByText(/valor maior que zero/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('marca o campo inválido para tecnologia assistiva (aria-invalid)', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(screen.getByLabelText('Descrição')).toHaveAttribute('aria-invalid', 'true');
  });

  it('rejeita valor não numérico e zero', async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();

    await user.type(screen.getByLabelText('Descrição'), 'Pizza');
    await user.type(screen.getByLabelText('Valor (R$)'), 'abc');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(onSubmit).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText('Valor (R$)'));
    await user.type(screen.getByLabelText('Valor (R$)'), '0');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submete valores válidos convertendo pt-BR para centavos inteiros', async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm(vi.fn().mockResolvedValue(undefined));

    await user.type(screen.getByLabelText('Descrição'), '  Mercado da semana  ');
    await user.type(screen.getByLabelText('Valor (R$)'), '1.234,56');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Mercado da semana', // trim aplicado
        amountCents: 123456, // string pt-BR → centavos, sem float
        type: 'expense',
        category: 'food',
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      }),
    );
  });
});
