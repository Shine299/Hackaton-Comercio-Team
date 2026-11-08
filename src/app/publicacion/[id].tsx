import { StartChatButton } from '@/features/chat';
import { PostDetailScreen } from '@/features/posts';

/** El «Escribir» del chat se inyecta aquí: `posts` no puede importar `chat` (SPEC-045). */
export default function PublicationRoute() {
  return <PostDetailScreen renderContact={(post) => <StartChatButton post={post} size="lg" />} />;
}
