<template>
    <header
        class="sticky top-0 z-50 w-full bg-white/95 border-b border-slate-200 shadow-sm backdrop-blur-md flex items-center justify-between px-8 py-3">
        <div class="flex items-center gap-3">
            <div
                class="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-sm">
                SK
            </div>
            <h1 class="text-base font-semibold text-slate-800">
                Oil Intelligence Dashboard
            </h1>
        </div>

        <div class="flex items-center gap-4">
            <input type="text" placeholder="🔍 검색"
                class="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-orange-400 outline-none" />
            <div
                class="flex items-center gap-2 bg-gradient-to-br from-indigo-500 to-blue-500 text-white px-3 py-1.5 rounded-xl text-sm font-medium shadow-md">
                <span class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-semibold">SN</span>
                <span>신수노</span>
            </div>
        </div>
    </header>
</template>
