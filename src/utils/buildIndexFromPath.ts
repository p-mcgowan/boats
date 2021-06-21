import path from 'path';
import getMethodFromFileName from '@/utils/getMethodFromFileName';
import ucFirst from '@/ucFirst';
import removeFileExtension from '@/removeFileExtension';
import _ from 'lodash';

export default function buildIndexFromPath(cleanPath: string, trimOpts?: any) {
  const dir = path.dirname(cleanPath);
  const filename = path.basename(cleanPath);
  const method = getMethodFromFileName(filename);
  let _path = cleanPath;
  if (trimOpts && trimOpts.dropBaseName && new RegExp(method + '$', 'i').test(_.camelCase(dir))) {
    _path = cleanPath.replace(filename, '');
  }
  const trim = typeof trimOpts === 'string' ? trimOpts : '';
  return ucFirst(_.camelCase(removeFileExtension(_path))).replace(trim, '');
}
