<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourseRequest;
use App\Http\Requests\Admin\UpdateCourseRequest;
use App\Models\Course;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Courses/Index', [
            'courses' => Course::withCount('products')
                ->orderBy('name')
                ->get()
                ->map(fn (Course $course) => [
                    'id' => $course->id,
                    'name' => $course->name,
                    'code' => $course->code,
                    'products_count' => $course->products_count,
                ]),
        ]);
    }

    public function store(StoreCourseRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Course::create($data);

        return back()->with('success', "Mata kuliah \"{$data['name']}\" ditambahkan.");
    }

    public function update(UpdateCourseRequest $request, Course $course): RedirectResponse
    {
        $data = $request->validated();

        $course->update($data);

        return back()->with('success', "Mata kuliah \"{$course->name}\" diperbarui.");
    }

    public function destroy(Course $course): RedirectResponse
    {
        // Aman dihapus meski masih dipakai produk — FK `course_id` nullOnDelete,
        // produk cuma kehilangan referensi mata kuliahnya, bukan ikut terhapus.
        $name = $course->name;
        $course->delete();

        return back()->with('success', "Mata kuliah \"{$name}\" dihapus.");
    }
}
