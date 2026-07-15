class ProjectModel {
  constructor({
    name = '',
    author = '',
    version = '1.0.0',
    path = '',
    stack = '',
    database = '',
    features = [],
    tables = [],
    relations = [],
    options = {}
  } = {}) {
    this.name = name;
    this.author = author;
    this.version = version;
    this.path = path;
    this.stack = stack;
    this.database = database;
    this.features = features;
    this.tables = tables;
    this.relations = relations;
    this.options = options;
  }
}

export default ProjectModel;