class ProjectValidator {
  static validate(project) {
    if (!project) {
      throw new Error('Project is required.');
    }

    if (!project.name) {
      throw new Error('Project name is required.');
    }

    if (!project.path) {
      throw new Error('Project path is required.');
    }

    if (!project.stack) {
      throw new Error('Project stack is required.');
    }

    return true;
  }
}

export default ProjectValidator;