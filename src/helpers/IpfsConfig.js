import { Web3Storage } from 'web3.storage';

const WEB3_STORAGE_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGIzOGE2MTlBN2VjNDNFMjYzRUJFMjA1MTEwNDAxNjQwNjY2YTA3YUIiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjIzNzU5ODUzMTUsIm5hbWUiOiJwb2x5QXV0b21hdG9ycyJ9.vkx0NNL3lpxD8daCqZ5rm0lPaOHWAvNLM9XGZAzHE0o'

export const WEB3_STORAGE_CLIENT = new Web3Storage({ token: WEB3_STORAGE_API_TOKEN })