# Guia de contribuição

## Checklist PR

- [Garantir que todos os casos de uso estão funcionando corretamente](https://youtu.be/KtHURppq0GY).
- [Garantir que telas e funcionalidades relacionadas não quebraram](https://youtu.be/KtHURppq0GY).
- Verificar o console se tem erros ou warning nas telas que você alterou.
- Formatar o código todo usando prettier.
- Escrever/corrigir testes caso necessário
- Revisar padrão da branch (definido aqui abaixo)
- Revisar padrão do commit (definido aqui abaixo)
- Caso tenha alteração visual, adicionar print no pull request
- [Requisitar revisão aos colegas](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/requesting-a-pull-request-review)

## Para uma funcionalidade nova

### branch

`feat/codig-da-issue/decricao-3-palavras`

### commit message

```
feat(#codigo-da-issue): descrição curta de algumas palavras

Se for algo que precise de explicação, explicar no corpo do commit
separado por linhas em brancos.

Responder: o que é? por quê? e como foi implementado?
```

## Para uma correção de bug

### branch
`fix/codig-da-issue/decricao-3-palavras`

### commit message

```
fix(#codigo-da-issue): descrição curta de algumas palavras

Se for algo que precise de explicação, explicar no corpo do commit
separado por linhas em brancos.

Responder: o que é? por quê? e como foi implementado?
```

## Para outros tipos de alterações
Use como referência https://www.conventionalcommits.org/en/v1.0.0/