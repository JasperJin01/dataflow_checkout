"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    # 两个电力应用
    path('api/usage/powertrend/<str:dataset>/', views.stream_power_trend, name='stream_power_trend'),
    path('api/usage/stateestimation/<str:dataset>/', views.stream_power_state_estimation, name='stream_power_state_estimation'),
    # 自动驾驶应用
    path('api/usage/runad/<str:idx>', views.run_uniad_command, name='run_uniad_command'),

    path('api/single/<str:platform>/<str:algo>/<str:dataset>/', views.run_single, name='run_single'),
    # 分布式执行接口
    path('part2/run_distributed/', views.run_distributed, name='run_distributed'),
    path('api/usage/run_all', views.run_all_datasets, name='run_all_datasets'),
    

    
    
    


    
    
    
    

    path('logfile/<str:filename>/', views.read_log_file, name="read_log_file"), 


]
