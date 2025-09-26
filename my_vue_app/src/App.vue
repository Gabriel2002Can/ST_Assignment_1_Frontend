<template>
  <div class="min-h-screen fitness-gradient-bg">
    <!-- Navigation -->
    <nav
      class="backdrop-blur-md bg-white/90 shadow-xl border-b border-white/20 sticky top-0 z-30"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center gap-8">
            <router-link
              to="/"
              class="text-xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent tracking-tight flex items-center gap-3"
            >
              <div
                class="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full shadow-lg"
              >
                <i class="fas fa-dumbbell text-white text-sm"></i>
              </div>
              FitTracker
            </router-link>
            <div class="hidden sm:flex sm:space-x-1">
              <router-link
                to="/"
                class="nav-item group flex items-center px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300"
                :class="{
                  'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg':
                    $route.path === '/' || $route.path === '/exercises',
                  'text-gray-600 hover:text-orange-500 hover:bg-white/50': !(
                    $route.path === '/' || $route.path === '/exercises'
                  ),
                }"
              >
                <i class="fas fa-home mr-2 text-sm"></i>
                Home
              </router-link>

              <router-link
                to="/history"
                class="nav-item group flex items-center px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300"
                :class="{
                  'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg':
                    $route.path === '/history',
                  'text-gray-600 hover:text-orange-500 hover:bg-white/50':
                    $route.path !== '/history',
                }"
              >
                <i class="fas fa-history mr-2 text-sm"></i>
                History
              </router-link>

              <router-link
                to="/calendar"
                class="nav-item group flex items-center px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300"
                :class="{
                  'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg':
                    $route.path === '/calendar',
                  'text-gray-600 hover:text-orange-500 hover:bg-white/50':
                    $route.path !== '/calendar',
                }"
              >
                <i class="fas fa-calendar-alt mr-2 text-sm"></i>
                Calendar
              </router-link>

              <router-link
                to="/manage"
                class="nav-item group flex items-center px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300"
                :class="{
                  'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg':
                    $route.path === '/manage',
                  'text-gray-600 hover:text-orange-500 hover:bg-white/50':
                    $route.path !== '/manage',
                }"
              >
                <i class="fas fa-cog mr-2 text-sm"></i>
                Manage
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div class="sm:hidden">
        <div
          class="pt-2 pb-3 space-y-2 bg-white/95 backdrop-blur-md border-t border-white/20"
        >
          <router-link
            to="/"
            class="block px-4 py-3 text-base font-semibold transition-all duration-300 rounded-lg mx-2"
            :class="
              $route.path === '/' || $route.path === '/exercises'
                ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-orange-500 hover:bg-white/80'
            "
          >
            <i class="fas fa-home mr-3"></i>Home
          </router-link>

          <router-link
            to="/history"
            class="block px-4 py-3 text-base font-semibold transition-all duration-300 rounded-lg mx-2"
            :class="
              $route.path === '/history'
                ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-orange-500 hover:bg-white/80'
            "
          >
            <i class="fas fa-history mr-3"></i>History
          </router-link>

          <router-link
            to="/calendar"
            class="block px-4 py-3 text-base font-semibold transition-all duration-300 rounded-lg mx-2"
            :class="
              $route.path === '/calendar'
                ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-orange-500 hover:bg-white/80'
            "
          >
            <i class="fas fa-calendar-alt mr-3"></i>Calendar
          </router-link>

          <router-link
            to="/manage"
            class="block px-4 py-3 text-base font-semibold transition-all duration-300 rounded-lg mx-2"
            :class="
              $route.path === '/manage'
                ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-orange-500 hover:bg-white/80'
            "
          >
            <i class="fas fa-cog mr-3"></i>Manage
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: sans-serif;
}
</style>
