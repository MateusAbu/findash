import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza como botão acessível com o texto', () => {
    render(<Button>Salvar</Button>);
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
  });

  it('dispara onClick ao clicar', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Salvar</Button>);

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('não dispara onClick quando disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Salvar
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Salvar' });
    expect(button).toBeDisabled();
    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it('aplica classes por variant e size (o contrato visual do DS)', () => {
    render(
      <Button variant="danger" size="lg">
        Excluir
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Excluir' });
    expect(button.className).toContain('bg-error');
    expect(button.className).toContain('h-12');
  });

  it('mescla className do consumidor resolvendo conflitos (tailwind-merge)', () => {
    render(<Button className="h-8">Ok</Button>);
    const button = screen.getByRole('button', { name: 'Ok' });
    expect(button.className).toContain('h-8'); // consumidor vence
    expect(button.className).not.toContain('h-10'); // default removido, não duplicado
  });

  it('usa type="button" por padrão (o default nativo "submit" causa submits fantasma)', () => {
    render(<Button>Ok</Button>);
    expect(screen.getByRole('button', { name: 'Ok' })).toHaveAttribute('type', 'button');
  });
});
