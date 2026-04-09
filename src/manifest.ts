import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { normalizePath } from './paths.js';

export interface SyncEntry {
  source: string;
  target: string;
  strategy: 'symlink' | 'copy';
  timestamp: string;
}

export interface Manifest {
  synced: SyncEntry[];
  agent_notice_shown: boolean;
}

export function readManifest(path: string): Manifest {
  if (!existsSync(path)) return { synced: [], agent_notice_shown: false };
  const raw = readFileSync(path, 'utf-8').replace(/^\uFEFF/, '');
  return JSON.parse(raw) as Manifest;
}

export function writeManifest(path: string, manifest: Manifest): void {
  writeFileSync(path, JSON.stringify(manifest, null, 2) + '\n');
}

export function hasTarget(manifest: Manifest, target: string): boolean {
  const t = normalizePath(target);
  return manifest.synced.some(e => normalizePath(e.target) === t);
}

export function hasSource(manifest: Manifest, source: string): boolean {
  const s = normalizePath(source);
  return manifest.synced.some(e => normalizePath(e.source) === s);
}

export function addEntry(manifest: Manifest, entry: SyncEntry): void {
  const t = normalizePath(entry.target);
  manifest.synced = manifest.synced.filter(e => normalizePath(e.target) !== t);
  manifest.synced.push(entry);
}

export function removeByTarget(manifest: Manifest, target: string): void {
  const t = normalizePath(target);
  manifest.synced = manifest.synced.filter(e => normalizePath(e.target) !== t);
}
