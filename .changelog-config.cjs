// Конфигурация conventional-changelog для русскоязычного проекта.
//
// conventional-changelog-angular (наш preset) по умолчанию подменяет
// тип коммита в transform() на английские названия секций
// (Features, Bug Fixes, Documentation и т.д.). Чтобы получить русские
// заголовки, мы переопределяем transform: он подменяет тип на русский.
// Angular-шаблон (mainTemplate) мы пробрасываем через свой writerOpts,
// иначе conventional-changelog-writer использует свой дефолтный, в котором
// нет вывода заголовков групп.
//
// Файлы шаблонов из angular-пресета читаем напрямую, синхронно.
const fs = require('node:fs');
const path = require('node:path');

const angularIndexPath = require.resolve('conventional-changelog-angular');
// .../conventional-changelog-angular/src/index.js
const templateDir = path.join(path.dirname(angularIndexPath), 'templates');

const template = fs.readFileSync(path.join(templateDir, 'template.hbs'), 'utf-8');
const header = fs.readFileSync(path.join(templateDir, 'header.hbs'), 'utf-8');
const commit = fs.readFileSync(path.join(templateDir, 'commit.hbs'), 'utf-8');
const footer = fs.readFileSync(path.join(templateDir, 'footer.hbs'), 'utf-8');

module.exports = {
  writerOpts: {
    mainTemplate: template,
    headerPartial: header,
    commitPartial: commit,
    footerPartial: footer,
    transform: (rawCommit) => {
      // Коммиты без распознанного типа пропускаем: коммиты без Conventional
      // Commits остаются «в коде», а не «в журнале изменений».
      const type = rawCommit.type;
      if (!type) return undefined;

      // scope "*" — это дефолт парсером, не несёт смысла.
      const scope = rawCommit.scope === '*' ? '' : rawCommit.scope;

      // Короткий хэш, если пришёл полный.
      const shortHash =
        typeof rawCommit.hash === 'string' ? rawCommit.hash.substring(0, 7) : rawCommit.shortHash;

      // Подменяем type на русское название секции. conventional-changelog-writer
      // группирует по `commit[groupBy]`, у нас это `type`. Шаблон angular выводит
      // `{{title}}` для каждой группы, и это значение берётся из нашего type.
      const russianType =
        {
          feat: 'Новое',
          fix: 'Исправления',
          perf: 'Исправления',
          docs: 'Документация',
        }[type] || type;

      return {
        ...rawCommit,
        type: russianType,
        scope,
        shortHash,
        subject: rawCommit.subject,
      };
    },
    groupBy: 'type',
    // Порядок секций в CHANGELOG: Исправления, Новое, остальное.
    commitGroupsSort: (a, b) => {
      const order = { Исправления: 0, Новое: 1, Документация: 2 };
      return (order[a.title] ?? 99) - (order[b.title] ?? 99);
    },
    commitsSort: ['scope', 'subject'],
    noteGroupsSort: 'asc',
  },
};
