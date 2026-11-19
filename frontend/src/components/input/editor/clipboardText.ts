import type {Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

const LIST_TYPES = ['bulletList', 'orderedList', 'taskList']

function listItemLines(item: ProseMirrorNode, marker: string, indent: string): string[] {
	const continuationIndent = indent + ' '.repeat(marker.length)
	const lines: string[] = []
	item.forEach((child, _offset, index) => {
		// only the first block of an item carries the marker, the rest are indented under it
		lines.push(...nodeLines(child, index === 0 ? indent + marker : continuationIndent))
	})
	return lines
}

function nodeLines(node: ProseMirrorNode, indent: string): string[] {
	if (LIST_TYPES.includes(node.type.name)) {
		const ordered = node.type.name === 'orderedList'
		const lines: string[] = []
		let number = 1
		node.forEach(item => {
			const marker = ordered ? `${number++}. ` : '- '
			lines.push(...listItemLines(item, marker, indent))
		})
		return lines
	}

	if (node.isText) {
		return [indent + (node.text ?? '')]
	}

	if (node.isTextblock) {
		return [indent + node.textBetween(0, node.content.size, '', '\n')]
	}

	const lines: string[] = []
	node.forEach(child => lines.push(...nodeLines(child, indent)))
	return lines
}

/**
 * Plain text for the clipboard. ProseMirror's default serializer drops list
 * markers, so a copied bullet list would lose its structure.
 */
export function serializeSliceAsPlainText(slice: Slice): string {
	const lines: string[] = []
	slice.content.forEach(node => lines.push(...nodeLines(node, '')))
	return lines.join('\n')
}
