// @flow
import type { FilterOpts } from '../../types';
import Project from '../../Project';
import * as options from '../../utils/options';
import execCommand from '../../utils/execCommand';

export type WorkspacesExecOptions = {|
  cwd?: string,
  command: string,
  commandArgs: options.Args,
  filterOpts: FilterOpts
|};

export function toWorkspacesExecOptions(
  args: options.Args,
  flags: options.Flags
): WorkspacesExecOptions {
  let [command, ...commandArgs] = flags['--'] || [];
  return {
    cwd: options.string(flags.cwd, 'cwd'),
    command,
    commandArgs,
    filterOpts: options.toFilterOpts(flags)
  };
}

export async function workspacesExec(opts: WorkspacesExecOptions) {
  let cwd = opts.cwd || process.cwd();
  let project = await Project.init(cwd);
  let packages = await project.getPackages();
  let filteredPackages = project.filterPackages(packages, opts.filterOpts);

  await project.runPackageTasks(filteredPackages, async pkg => {
    await execCommand(project, pkg, opts.command, opts.commandArgs);
  });
}
