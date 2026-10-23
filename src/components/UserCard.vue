<script setup>
import { computed } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const inisial = computed(() =>
  (props.user.name || props.user.username || '?')
    .split(' ')
    .map((k) => k[0])
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)
</script>

<template>
  <li class="user-card">
    <span class="avatar">{{ inisial }}</span>
    <div class="info">
      <strong>{{ user.name }}</strong>
      <span>{{ user.email }}</span>
    </div>
    <span v-if="user.username" class="username">@{{ user.username }}</span>
  </li>
</template>

<style scoped>
.user-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.user-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-sm);
}
.avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--violet-soft);
  color: var(--violet);
  font-weight: 600;
  font-size: 13px;
}
.info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.info strong {
  font-weight: 600;
}
.info span {
  font-size: 12.5px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.username {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--surface-muted);
  border: 1px solid var(--border);
  padding: 0.1rem 0.5rem;
  border-radius: 99px;
}
</style>
