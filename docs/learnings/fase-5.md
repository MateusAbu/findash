# Fase 5 — Aprendizados

> Anotações com as MINHAS palavras (a IA só revisa a precisão técnica).

## O experimento "sem singleton" (critério de aceite da T-5.1)

<!-- Descreva o que você fez e o que viu:
     1. SEM shared: a sequência de navegação que expôs o bug (qual página
        visitou primeiro? o que ficou desatualizado?)
     2. Por que o bug é intermitente (dica: quem foi ao localStorage, quando?)
     3. COM singleton: o que mudou e por quê (o que o share scope entregou?) -->

(escreva aqui)

## Store vs. eventos — minha tabela de decisão (critério de aceite da T-5.3)

<!-- Complete com SUAS palavras, sem consultar a resposta da IA: -->

| Critério | Store singleton | Custom Event |
| --- | --- | --- |
| Uso quando… | | |
| Acoplamento que aceito | | |
| Exemplo real do FinDash | | |
| Falha clássica | | |

Cenários (justifique cada escolha):

1. Badge de notificações não lidas no header → store ou evento? Por quê?
2. Filtro global de mês → store, evento ou outra coisa? Por quê?
3. MFE de relatórios em Vue → como ele participa da comunicação?
